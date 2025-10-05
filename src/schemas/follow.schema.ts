import z from "zod";
import { paginationSchema } from "./general.schema.js";

// req.params
export const followParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "id must be a positive integer")
    .transform((val) => Number(val)),
});

// req.query
const followFilterSchema = z.object({
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

export const followQuerySchema = z.object({
  ...paginationSchema.shape,
  ...followFilterSchema.shape,
});
