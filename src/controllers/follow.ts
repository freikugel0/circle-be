import type { Request, Response } from "express";
import type { JwtUser } from "../middlewares/auth.js";
import {
  followParamSchema,
  followQuerySchema,
} from "../schemas/follow.schema.js";
import { AppError } from "../middlewares/error.js";
import RESPONSE_CODES from "../constants/responseCodes.js";
import prisma from "../utils/client.js";
import { createPaginatedResponse } from "../utils/response.js";

export const followUser = async (req: Request, res: Response) => {
  const user = (req as any).user as JwtUser;

  const params = followParamSchema.safeParse(req.params);
  if (!params.success) {
    throw new AppError(
      400,
      RESPONSE_CODES.API.INVALID_ID_SELECTOR,
      "Invalid user id",
      params.error.issues.map((err) => ({
        path: err.path,
        msg: err.message,
      })),
    );
  }

  const { id } = params.data;

  const targetUser = await prisma.user.findUnique({
    select: { id: true },
    where: { id },
  });
  if (!targetUser)
    throw new AppError(
      404,
      RESPONSE_CODES.API.ID_SELECTOR_NOT_FOUND,
      "User target not found",
    );

  try {
    await prisma.follow.create({
      data: {
        follower_id: user.id,
        following_id: id,
      },
    });
    return res.status(201).json({ following: true });
  } catch (err: any) {
    if (err.code === "P2002") {
      await prisma.follow.delete({
        where: {
          following_id_follower_id: {
            follower_id: user.id,
            following_id: id,
          },
        },
      });
      return res.status(204).json({ following: false });
    }
  }
};

export const getFollowCount = async (req: Request, res: Response) => {
  const user = (req as any).user as JwtUser;

  const followers = await prisma.follow.count({
    where: { following_id: user.id },
  });

  const following = await prisma.follow.count({
    where: { follower_id: user.id },
  });

  return res.status(200).json({
    followers,
    following,
  });
};

export const getFollowers = async (req: Request, res: Response) => {
  const user = (req as any).user as JwtUser;

  const query = followQuerySchema.safeParse(req.query);
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

  const [followers, total] = await Promise.all([
    prisma.follow.findMany({
      where: {
        ...where,
        following_id: user.id,
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      omit: {
        follower_id: true,
        following_id: true,
      },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            full_name: true,
            photo_profile: true,
            following: {
              where: { follower_id: user.id },
              select: { id: true },
            },
          },
        },
      },
    }),
    prisma.follow.count({
      where: { following_id: user.id },
    }),
  ]);

  return res.status(200).json(
    createPaginatedResponse({
      page,
      limit,
      total,
      data: followers.map((f) => ({
        ...f,
        follower: {
          ...f.follower,
          following: undefined,
        },
        followed: f.follower.following.length > 0,
      })),
    }),
  );
};

export const getFollowing = async (req: Request, res: Response) => {
  const user = (req as any).user as JwtUser;

  const query = followQuerySchema.safeParse(req.query);
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

  const [following, total] = await Promise.all([
    prisma.follow.findMany({
      where: {
        ...where,
        follower_id: user.id,
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      omit: {
        follower_id: true,
        following_id: true,
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            full_name: true,
            photo_profile: true,
            following: {
              where: { follower_id: user.id },
              select: { id: true },
            },
          },
        },
      },
    }),
    prisma.follow.count({
      where: { follower_id: user.id },
    }),
  ]);

  return res.status(200).json(
    createPaginatedResponse({
      page,
      limit,
      total,
      data: following.map((f) => ({
        ...f,
        following: {
          ...f.following,
          following: undefined,
        },
        followed: f.following.following.length > 0,
      })),
    }),
  );
};

export const getSuggestedFollowing = async (req: Request, res: Response) => {
  const user = (req as any).user as JwtUser;

  // Get user followed by current user
  const following = await prisma.follow.findMany({
    where: { follower_id: user.id },
    select: { following_id: true },
  });
  const followingIds = following.map((f) => f.following_id);

  // Friends of Friends
  const fof = await prisma.user.findMany({
    where: {
      followers: {
        some: {
          follower_id: { in: followingIds }, // followed by current user's following
        },
      },
      NOT: {
        id: { in: [...followingIds, user.id] }, // exclude self & already following
      },
    },
    select: {
      id: true,
      username: true,
      full_name: true,
      photo_profile: true,
      _count: { select: { followers: true } }, // get followers count for ranking
    },
    orderBy: {
      followers: { _count: "desc" }, // sort desc by followers count
    },
    take: 5,
  });

  if (fof.length >= 5) {
    return res.status(200).json({ suggestions: fof });
  }

  // fallback → popular
  const popular = await prisma.user.findMany({
    where: {
      NOT: {
        id: { in: [...followingIds, user.id] },
      },
    },
    select: {
      id: true,
      username: true,
      full_name: true,
      photo_profile: true,
      _count: { select: { followers: true } },
    },
    orderBy: {
      followers: { _count: "desc" }, // populer all-time
    },
    take: 5 - fof.length,
  });

  return res.status(200).json({ suggestions: [...fof, ...popular] });
};
