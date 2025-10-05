import type { Request, Response } from "express";
import {
  threadDetailParamSchema,
  threadQuerySchema,
  threadBodySchema,
  threadParamSchema,
} from "../schemas/thread.schema.js";
import { AppError } from "../middlewares/error.js";
import RESPONSE_CODES from "../constants/responseCodes.js";
import prisma from "../utils/client.js";
import type { JwtUser } from "../middlewares/auth.js";
import { createPaginatedResponse } from "../utils/response.js";
import { notifyUser } from "../services/notificationService.js";
import { cacheWrap } from "../utils/cache.js";

export const getThreads = async (req: Request, res: Response) => {
  const user = (req as any).user as JwtUser;

  const params = threadParamSchema.safeParse(req.params);
  if (!params.success) {
    throw new AppError(
      400,
      RESPONSE_CODES.API.INVALID_QUERY_PARAMS,
      "Invalid path params",
      params.error.issues.map((err) => ({
        path: err.path,
        msg: err.message,
      })),
    );
  }

  const query = threadQuerySchema.safeParse(req.query);
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

  const { userId } = params.data;
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
  if (userId) where.created_by = userId;

  // Sort
  const orderBy: any = sort
    ? { [sort.field as string]: sort.order }
    : { created_at: "desc" };

  const cacheKey = userId
    ? `threads:user:${userId}:${page}:${limit}:${sort?.field ?? "created_at"}:${sort?.order ?? "desc"}:${startDate ?? ""}:${endDate ?? ""}`
    : `threads:${page}:${limit}:${sort?.field ?? "created_at"}:${sort?.order ?? "desc"}:${startDate ?? ""}:${endDate ?? ""}`;

  const threadQuery = cacheWrap(cacheKey, 30, async () => {
    return await prisma.thread.findMany({
      where: userId ? { ...where, created_by: userId } : where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      omit: {
        created_by: true,
      },
      include: {
        author: {
          omit: {
            email: true,
            password: true,
            created_at: true,
            updated_at: true,
            bio: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
        likes: {
          where: { created_by: user.id },
          select: { id: true },
        },
      },
    });
  });

  const [threads, total] = await Promise.all([
    threadQuery,
    prisma.thread.count({ where }),
  ]);

  return res.status(200).json(
    createPaginatedResponse({
      page,
      limit,
      total,
      data: threads.map((thread) => ({
        ...thread,
        liked: thread.likes.length > 0,
        likes: undefined,
        canEdit: user.id === thread.author.id,
        canDelete: user.id === thread.author.id,
      })),
    }),
  );
};

export const getThreadDetails = async (req: Request, res: Response) => {
  const user = (req as any).user as JwtUser;

  const params = threadDetailParamSchema.safeParse(req.params);
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

  const thread = await cacheWrap(`threadDetails:${id}`, 30, async () => {
    return prisma.thread.findUnique({
      where: { id },
      include: {
        author: {
          omit: {
            email: true,
            password: true,
            created_at: true,
            updated_at: true,
            bio: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
        likes: {
          where: { created_by: user.id },
          select: { id: true },
        },
      },
    });
  });

  if (!thread)
    throw new AppError(
      400,
      RESPONSE_CODES.API.ID_SELECTOR_NOT_FOUND,
      "Thread not found",
    );

  const response = {
    thread: {
      ...thread,
      liked: thread.likes.length > 0,
      likes: undefined,
      canEdit: user.id === thread.author.id,
      canDelete: user.id === thread.author.id,
    },
  };

  return res.status(200).json(response);
};

// TODO: Refactor image upload feature to multiple images
export const createThread = async (req: Request, res: Response) => {
  const user = (req as any).user as JwtUser;

  const body = threadBodySchema.safeParse(req.body);
  if (!body.success) {
    throw new AppError(
      400,
      RESPONSE_CODES.THREAD.VALIDATION_ERROR,
      "Error in validation",
      body.error.issues.map((err) => ({
        path: err.path,
        msg: err.message,
      })),
    );
  }

  const { title, content } = body.data;
  const image = req.file;

  const thread = await prisma.thread.create({
    data: {
      created_by: user.id,
      title: title.trim(),
      content: content.text.trim(),
      image: image?.filename,
    },
  });

  // Handle mentions
  content.mentions.forEach(async (m) => {
    const userExist = await prisma.user.findUnique({
      select: { id: true },
      where: { username: m },
    });

    if (userExist && userExist.id !== user.id) {
      notifyUser(userExist.id, {
        type: "MENTION",
        message: `${user.id} is mentioning ${userExist.id}`,
        fromUserId: user.id,
        threadId: thread.id,
      });
    }
  });

  return res.status(201).json({});
};
