import prisma from "../utils/client.js";
import { sendToUser } from "../ws/utils.js";

type NotificationType = "MENTION" | "FOLLOW" | "LIKE" | "REPLY";

type NotificationPayload = {
  type: NotificationType;
  message: string;
  threadId?: number;
  fromUserId: number;
};

export const notifyUser = async (
  userId: number,
  payload: NotificationPayload,
  persist = true,
) => {
  if (persist) {
    const notification = await prisma.notification.create({
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
      data: {
        user_id: userId,
        type: payload.type,
        message: payload.message,
        thread_id: payload.threadId,
        from_user_id: payload.fromUserId,
      },
    });

    sendToUser(userId, {
      event: "NOTIFICATION",
      payload: notification,
      createdAt: new Date(),
    });
  } else {
    sendToUser(userId, {
      event: "NOTIFICATION",
      payload: { ...payload },
      createdAt: new Date(),
    });
  }
};
