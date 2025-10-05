import z from "zod";

// req.params
export const likeParamSchema = z
  .object({
    threadId: z
      .string()
      .regex(/^\d+$/, "id must be a positive integer")
      .transform((val) => Number(val))
      .optional(),
    replyId: z
      .string()
      .regex(/^\d+$/, "id must be a positive integer")
      .transform((val) => Number(val))
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.threadId && !data.replyId) {
      ctx.addIssue({
        code: "custom",
        message: "Either replyId or threadId is required",
      });
    }
    if (data.threadId && data.replyId) {
      ctx.addIssue({
        code: "custom",
        message: "Only one of threadId or replyId should be provided",
      });
    }
  });
