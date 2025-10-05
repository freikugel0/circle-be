import type { Request, Response } from "express";
import type { JwtUser } from "../middlewares/auth.js";
import { likeParamSchema } from "../schemas/like.schema.js";
import { AppError } from "../middlewares/error.js";
import RESPONSE_CODES from "../constants/responseCodes.js";
import prisma from "../utils/client.js";

export const likeThreadOrReply = async (req: Request, res: Response) => {
  const user = (req as any).user as JwtUser;

  const params = likeParamSchema.safeParse(req.params);
  if (!params.success) {
    throw new AppError(
      400,
      RESPONSE_CODES.API.INVALID_ID_SELECTOR,
      "Invalid params validation",
      params.error.issues.map((err) => ({
        path: err.path,
        msg: err.message,
      })),
    );
  }

  const { threadId, replyId } = params.data;

  if (threadId) {
    const thread = await prisma.thread.findUnique({
      select: { id: true },
      where: { id: threadId },
    });
    if (!thread)
      throw new AppError(
        404,
        RESPONSE_CODES.API.ID_SELECTOR_NOT_FOUND,
        "Thread not found",
      );

    try {
      await prisma.like.create({
        data: {
          created_by: user.id,
          thread_id: thread.id,
        },
      });
      return res.status(201).json({ liked: true });
    } catch (err: any) {
      if (err.code === "P2002") {
        await prisma.like.delete({
          where: {
            thread_id_created_by: {
              created_by: user.id,
              thread_id: thread.id,
            },
          },
        });
        return res.status(204).json({ liked: false });
      }
    }
  } else if (replyId) {
    const reply = await prisma.reply.findUnique({
      select: { id: true },
      where: { id: replyId },
    });
    if (!reply)
      throw new AppError(
        404,
        RESPONSE_CODES.API.ID_SELECTOR_NOT_FOUND,
        "Reply not found",
      );

    try {
      await prisma.like.create({
        data: {
          created_by: user.id,
          reply_id: reply.id,
        },
      });
      return res.status(201).json({ liked: true });
    } catch (err: any) {
      if (err.code === "P2002") {
        await prisma.like.delete({
          where: {
            reply_id_created_by: {
              created_by: user.id,
              reply_id: reply.id,
            },
          },
        });
        return res.status(204).json({ liked: false });
      }
    }
  }
};
