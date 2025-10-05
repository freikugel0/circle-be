import z from "zod";
import { paginationSchema } from "./general.schema.js";

// req.body
export const threadBodySchema = z.object({
  title: z
    .string()
    .min(1, { error: "Minimum title is 1 character" })
    .max(150, { error: "Maximum title is 150 characters" }),
  content: z
    .string()
    .min(1, { error: "Minimum content is 1 character" })
    .max(1000, { error: "Maximum content is 1000 characters" })
    .transform((val) => {
      const mentions = val.match(/@\w+/g) || [];
      return { text: val, mentions: mentions.map((m) => m.slice(1)) };
    }),
});

// req.params
export const threadParamSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, "id must be a positive integer")
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
});

export const threadDetailParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "id must be a positive integer")
    .transform((val) => Number(val)),
});

// req.query
const threadFilterSchema = z.object({
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

export const threadQuerySchema = z.object({
  ...paginationSchema.shape,
  ...threadFilterSchema.shape,
});
