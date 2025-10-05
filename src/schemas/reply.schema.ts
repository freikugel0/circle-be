import z from "zod";
import { paginationSchema } from "./general.schema.js";

// req.body
export const replyBodySchema = z.object({
  content: z
    .string()
    .min(1, { error: "Minimum content is 1 character" })
    .max(1000, { error: "Maximum content is 1000 characters" }),
});

// req.params
export const replyParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "id must be a positive integer")
    .transform((val) => Number(val)),
});

// req.query
const replyFilterSchema = z.object({
  startDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined))
    .refine((val) => val === undefined || !isNaN(val.getTime()), {
      message: "Invalid startDate",
    }),
  endDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined))
    .refine((val) => val === undefined || !isNaN(val.getTime()), {
      message: "Invalid endDate",
    }),
});

export const replyQuerySchema = z.object({
  ...paginationSchema.shape,
  ...replyFilterSchema.shape,
});
