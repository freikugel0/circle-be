import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import RESPONSE_CODES from "../constants/responseCodes.js";

export class AppError extends Error {
  status: number;
  code: string;
  details?: any;

  constructor(status: number, code: string, message: string, details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const notFound = (req: Request, _res: Response, _next: NextFunction) => {
  throw new AppError(404, RESPONSE_CODES.API.NOT_FOUND, "Not found", {
    path: req.originalUrl,
    method: req.method,
  });
};

export const multerErrorHandler = (
  err: any,
  _req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(
        new AppError(
          413,
          RESPONSE_CODES.FILE.TOO_LARGE,
          "File too large, max 3MB",
        ),
      );
    }
    return next(
      new AppError(
        400,
        RESPONSE_CODES.FILE.UPLOAD_FAILED,
        `Failed to upload image: ${err.message}`,
      ),
    );
  }
  next(err);
};

export const serverError = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(err);

  if (err instanceof AppError) {
    const details = err.details
      ? !Array.isArray(err.details)
        ? [err.details]
        : err.details
      : [];
    return res.status(err.status).json({
      code: err.code,
      error: err.message,
      details,
    });
  }

  return res.status(500).json({
    code: RESPONSE_CODES.API.UNEXPECTED_ERROR,
    error: err.message,
    details: [],
  });
};
