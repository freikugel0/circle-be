import type { Request, Response } from "express";
import {
  notificationParamSchema,
  notificationQuerySchema,
} from "../schemas/notification.schema.js";
import { AppError } from "../middlewares/error.js";
import RESPONSE_CODES from "../constants/responseCodes.js";
import prisma from "../utils/client.js";
import { createPaginatedResponse } from "../utils/response.js";
import type { JwtUser } from "../middlewares/auth.js";

export const getNotifications = async (req: Request, res: Response) => {
  const user = (req as any).user as JwtUser;

  const query = notificationQuerySchema.safeParse(req.query);
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

  const { page, limit, sort, startDate, endDate } = query.data;

  // Filter
  const where: any = {};
  if (startDate && endDate) {
    where.created_at = { gte: startDate, lte: endDate };
  } else if (startDate) {
    where.created_at = { gte: startDate };
  } else if (endDate) {
    where.created_at = { lte: endDate };
  }

  // Sort
  const orderBy: any = sort
    ? { [sort.field as string]: sort.order }
    : { created_at: "desc" };

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: {
        ...where,
        user_id: user.id,
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            photo_profile: true,
          },
        },
        from: {
          select: {
            id: true,
            username: true,
            photo_profile: true,
          },
        },
        thread: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    }),
    prisma.notification.count({ where }),
  ]);

  return res.status(200).json(
    createPaginatedResponse({
      page,
      limit,
      total,
      data: notifications,
    }),
  );
};

export const readNotifications = async (req: Request, res: Response) => {
  const user = (req as any).user as JwtUser;

  await prisma.notification.updateMany({
    where: { user_id: user.id, read: false },
    data: { read: true },
  });

  return res.status(204).json({});
};

export const readNotification = async (req: Request, res: Response) => {
  const user = (req as any).user as JwtUser;

  const params = notificationParamSchema.safeParse(req.params);
  if (!params.success) {
    throw new AppError(
      400,
      RESPONSE_CODES.API.INVALID_ID_SELECTOR,
      "Invalid thread id",
      params.error.issues.map((err) => ({
        path: err.path,
        msg: err.message,
      })),
    );
  }

  const { id } = params.data;

  const existing = await prisma.notification.findUnique({
    select: { id: true },
    where: { id, user_id: user.id },
  });
  if (!existing) {
    throw new AppError(
      404,
      RESPONSE_CODES.API.ID_SELECTOR_NOT_FOUND,
      "Notification not found",
    );
  }

  await prisma.notification.update({
    where: { id, user_id: user.id },
    data: { read: true },
  });

  return res.status(204).json({});
};

export const deleteNotification = async (req: Request, res: Response) => {
  const user = (req as any).user as JwtUser;

  const params = notificationParamSchema.safeParse(req.params);
  if (!params.success) {
    throw new AppError(
      400,
      RESPONSE_CODES.API.INVALID_ID_SELECTOR,
      "Invalid thread id",
      params.error.issues.map((err) => ({
        path: err.path,
        msg: err.message,
      })),
    );
  }

  const { id } = params.data;

  const existing = await prisma.notification.findUnique({
    select: { id: true },
    where: { id, user_id: user.id },
  });
  if (!existing) {
    throw new AppError(
      404,
      RESPONSE_CODES.API.ID_SELECTOR_NOT_FOUND,
      "Notification not found",
    );
  }

  await prisma.notification.delete({
    where: { id, user_id: user.id },
  });

  return res.status(204).json({});
};

export const deleteNotifications = async (req: Request, res: Response) => {
  const user = (req as any).user as JwtUser;

  await prisma.notification.deleteMany({
    where: { user_id: user.id },
  });

  return res.status(204).json({});
};
