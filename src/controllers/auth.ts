import type { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import RESPONSE_CODES from "../constants/responseCodes.js";
import { AppError } from "../middlewares/error.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import { hashPassword, signJWT, verifyPassword } from "../utils/auth.js";
import prisma from "../utils/client.js";
import type { Prisma } from "../../generated/prisma/index.js";

export const register = async (req: Request, res: Response) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) {
    throw new AppError(
      400,
      RESPONSE_CODES.AUTH.VALIDATION_ERROR,
      "Error in validation",
      parse.error.issues.map((err) => ({
        path: err.path,
        msg: err.message,
      })),
    );
  }

  const { username, email, password } = parse.data;

  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: passwordHash,
      },
      select: {
        id: true,
        username: true,
        email: true,
        created_at: true,
      },
    });
    return res.status(201).json({ user });
  } catch (err: any) {
    if ((err as Prisma.PrismaClientKnownRequestError).code === "P2002") {
      throw new AppError(
        409,
        RESPONSE_CODES.AUTH.EMAIL_ALREADY_REGISTERED,
        "Email already registered",
      );
    }
  }
};

export const login = async (req: Request, res: Response) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    throw new AppError(
      400,
      RESPONSE_CODES.AUTH.VALIDATION_ERROR,
      "Email or password is invalid",
    );
  }

  const { identifier, password } = parse.data;
  const isEmail = identifier.includes("@");

  // Get user by email
  const user = await prisma.user.findUnique({
    where: isEmail ? { email: identifier } : { username: identifier },
  });
  if (!user)
    throw new AppError(
      404,
      RESPONSE_CODES.AUTH.USER_NOT_FOUND,
      "User not found",
    );

  // Verify password
  const valid = await verifyPassword(password, user.password);
  if (!valid)
    throw new AppError(
      401,
      RESPONSE_CODES.AUTH.INCORRECT_PASSWORD,
      "Password is incorrect",
    );

  const token = signJWT({
    id: user.id,
    email: user.email,
  });

  return res.status(200).json({ token });
};

export const resetPasswordRequest = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user)
    throw new AppError(
      404,
      RESPONSE_CODES.AUTH.USER_NOT_FOUND,
      "User not found",
    );

  // Generate random token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Store temporary reset password token in db
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes
    },
  });

  return res.status(200).json({ resetToken });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const record = await prisma.passwordResetToken.findUnique({
    where: { token: hashedToken },
  });

  if (!record || record.expiresAt < new Date()) {
    throw new AppError(
      400,
      RESPONSE_CODES.AUTH.RESET_TOKEN_INVALID,
      "Invalid or expired token reset",
    );
  }

  // Update user password
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: record.userId },
    data: { password: hashedPassword },
  });

  // Delete temporary token from database
  await prisma.passwordResetToken.delete({
    where: { id: record.id },
  });

  res.status(204).json({});
};
