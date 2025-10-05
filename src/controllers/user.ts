import type { Request, Response } from "express";
import type { JwtUser } from "../middlewares/auth.js";
import prisma from "../utils/client.js";
import { userBodySchema, userQuerySchema } from "../schemas/user.schema.js";
import { AppError } from "../middlewares/error.js";
import RESPONSE_CODES from "../constants/responseCodes.js";
import { cacheWrap } from "../utils/cache.js";
import { createPaginatedResponse } from "../utils/response.js";

export const getMe = async (req: Request, res: Response) => {
  const user = (req as any).user as JwtUser;

  const result = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      username: true,
      full_name: true,
      email: true,
      photo_profile: true,
      banner: true,
      bio: true,
      created_at: true,
      updated_at: true,
    },
  });

  return res.status(200).json({ user: result });
};

export const editMe = async (req: Request, res: Response) => {
  const user = (req as any).user as JwtUser;

  const body = userBodySchema.safeParse(req.body);
  if (!body.success) {
    throw new AppError(
      400,
      RESPONSE_CODES.USER.VALIDATION_ERROR,
      "Error in validation",
      body.error.issues.map((err) => ({
        path: err.path,
        msg: err.message,
      })),
    );
  }

  const { email, username, full_name, bio } = body.data;
  const image = req.files as {
    photo_profile?: Express.Multer.File[];
    banner?: Express.Multer.File[];
  };

  const previousImages = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      photo_profile: true,
      banner: true,
    },
  });

  const result = await prisma.user.update({
    where: { id: user.id },
    omit: { password: true },
    data: {
      email,
      username,
      full_name,
      bio,
      photo_profile:
        image.photo_profile?.[0]?.filename ?? previousImages?.photo_profile,
      banner: image.banner?.[0]?.filename ?? previousImages?.banner,
    },
  });

  return res.status(200).json({ user: result });
};

export const getUsers = async (req: Request, res: Response) => {
  const user = (req as any).user as JwtUser;

  const query = userQuerySchema.safeParse(req.query);
  if (!query.success) {
    throw new AppError(
      400,
      RESPONSE_CODES.API.INVALID_QUERY_PARAMS,
      "Invalid query params",
      query.error.issues.map((err) => ({
        path: err.path,
        msg: err.message,
      })),
    );
  }

  const { page, limit, sort, keyword } = query.data;

  // Filter
  const where: any = {};
  if (keyword) {
    where.OR = [
      { username: { contains: keyword, mode: "insensitive" } },
      { full_name: { contains: keyword, mode: "insensitive" } },
    ];
  }

  // Sort
  const orderBy: any = sort
    ? { [sort.field as string]: sort.order }
    : { created_at: "desc" };

  const [users, total] = await Promise.all([
    cacheWrap(
      `usersSearch:${page}:${limit}:${sort?.field ?? "created_at"}:${sort?.order ?? "desc"}:${keyword}`,
      30,
      async () => {
        return prisma.user.findMany({
          where: {
            ...where,
            NOT: { id: user.id },
          },
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            username: true,
            full_name: true,
            photo_profile: true,
            following: {
              select: { id: true },
              where: { follower_id: user.id },
            },
          },
        });
      },
    ),
    prisma.user.count({ where }),
  ]);

  return res.status(200).json(
    createPaginatedResponse({
      page,
      limit,
      total,
      data: users.map((f) => ({
        ...f,
        following: undefined,
        followed: f.following.length > 0,
      })),
    }),
  );
};
