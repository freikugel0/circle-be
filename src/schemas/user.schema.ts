import z from "zod";
import { paginationSchema } from "./general.schema.js";

// req.body
export const userBodySchema = z.object({
  username: z
    .string()
    .min(5, { message: "Username must be at least 5 characters" })
    .max(20, { message: "Username must be at most 20 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores",
    })
    .optional(),
  full_name: z
    .string()
    .min(1, { message: "Full name must not be empty" })
    .max(50, { message: "Full name must be at most 50 characters" })
    .optional(),
  email: z.email({ message: "Invalid email format" }).optional(),
  bio: z
    .string()
    .max(160, { message: "Bio must be at most 160 characters" })
    .nullable()
    .optional(),
});

// req.query
const userFilterSchema = z.object({
  keyword: z.string().min(1, "Keyword must not be empty").optional(),
});

export const userQuerySchema = z.object({
  ...paginationSchema.shape,
  ...userFilterSchema.shape,
});
