import type { Request, Response } from "express";
import {
  replyBodySchema,
  replyParamSchema,
  replyQuerySchema,
} from "../schemas/reply.schema.js";
import { AppError } from "../middlewares/error.js";
import RESPONSE_CODES from "../constants/responseCodes.js";
import prisma from "../utils/client.js";
import { createPaginatedResponse } from "../utils/response.js";
import type { JwtUser } from "../middlewares/auth.js";
import { cacheWrap } from "../utils/cache.js";

export const getThreadReplies = async (req: Request, res: Response) => {
  const user = (req as any).user as JwtUser;

  const params = replyParamSchema.safeParse(req.params);
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

  const query = replyQuerySchema.safeParse(req.query);
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

  const { id } = params.data;
  const { page, limit, sort, startDate, endDate } = query.data;

  const thread = await prisma.thread.findUnique({
    select: { id: true },
    where: { id },
  });
  if (!thread)
    throw new AppError(
      400,
      RESPONSE_CODES.API.ID_SELECTOR_NOT_FOUND,
      "Thread not found",
    );

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

  const [replies, total] = await Promise.all([
    cacheWrap(
      `replies:${thread.id}${page}:${limit}:${sort?.field ?? "created_at"}:${sort?.order ?? "desc"}:${startDate ?? ""}:${endDate ?? ""}`,
      30,
      async () => {
        return prisma.reply.findMany({
          where: {
            thread_id: id,
            ...where,
          },
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
              select: { likes: true },
            },
            likes: {
              where: { created_by: user.id },
              select: { id: true },
            },
          },
        });
      },
    ),
    prisma.reply.count({ where: { thread_id: id, ...where } }),
  ]);

  return res.status(200).json(
    createPaginatedResponse({
      page,
      limit,
      total,
      data: replies.map((reply) => ({
        ...reply,
        liked: reply.likes.length > 0,
        likes: undefined,
        canEdit: user.id === reply.author.id,
        canDelete: user.id === reply.author.id,
      })),
    }),
  );
};

export const createThreadReply = async (req: Request, res: Response) => {
  const user = (req as any).user as JwtUser;

  const body = replyBodySchema.safeParse(req.body);
  if (!body.success) {
    throw new AppError(
      400,
      RESPONSE_CODES.REPLY.VALIDATION_ERROR,
      "Error in validation",
      body.error.issues.map((err) => ({
        path: err.path,
        msg: err.message,
      })),
    );
  }

  const params = replyParamSchema.safeParse(req.params);
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

  const { content } = body.data;
  const image = req.file;
  const { id } = params.data;

  const thread = await prisma.thread.findUnique({
    select: { id: true },
    where: { id },
  });
  if (!thread)
    throw new AppError(
      404,
      RESPONSE_CODES.API.ID_SELECTOR_NOT_FOUND,
      "Thread not found",
    );

  await prisma.reply.create({
    data: {
      created_by: user.id,
      thread_id: id,
      content,
      image: image?.filename,
    },
  });

  return res.status(201).json({});
};

export const deleteReply = async (req: Request, res: Response) => {
  const user = (req as any).user as JwtUser;

  const params = replyParamSchema.safeParse(req.params);
  if (!params.success) {
    throw new AppError(
      400,
      RESPONSE_CODES.API.INVALID_ID_SELECTOR,
      "Invalid reply id",
      params.error.issues.map((err) => ({
        path: err.path,
        msg: err.message,
      })),
    );
  }

  const { id } = params.data;

  const reply = await prisma.reply.findUnique({
    where: { id, created_by: user.id },
  });
  if (!reply) {
    throw new AppError(
      404,
      RESPONSE_CODES.API.ID_SELECTOR_NOT_FOUND,
      "Reply not found",
    );
  }

  await prisma.reply.delete({
    where: { id, created_by: user.id },
  });

  return res.status(204).json({});
};
