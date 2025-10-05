import type { Request, Response, NextFunction } from "express";
import { AppError } from "./error.js";
import { verifyJWT } from "../utils/auth.js";
import RESPONSE_CODES from "../constants/responseCodes.js";

export type JwtUser = {
  id: number;
  email: string;
  iat: number;
  exp: number;
};

const getToken = (req: Request): string | null => {
  const headerToken = () => {
    const authHeader = req.headers.authorization;
    return authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;
  };

  return headerToken();
};

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token = getToken(req);

  if (!token) {
    throw new AppError(
      401,
      RESPONSE_CODES.AUTH.TOKEN_MISSING,
      "Missing token header",
    );
  }

  try {
    const decoded = verifyJWT<JwtUser>(token);
    (req as any).user = decoded;
    next();
  } catch {
    throw new AppError(
      401,
      RESPONSE_CODES.AUTH.TOKEN_INVALID,
      "Invalid or expired token",
    );
  }
};

export const authorize = () => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user as JwtUser | undefined;
    if (!user)
      throw new AppError(401, RESPONSE_CODES.AUTH.UNAUTHORIZED, "Unauthorized");
    next();
  };
};
