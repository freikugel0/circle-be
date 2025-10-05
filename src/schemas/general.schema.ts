import z from "zod";

export const sortSchema = z
  .string()
  .regex(/^[a-zA-Z_]+\.(asc|desc)$/, "Invalid sort format")
  .transform((val) => {
    const [field, order] = val.split(".");
    return { field, order };
  });

export const paginationSchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .pipe(z.number().int().positive().max(100).default(30)),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .pipe(z.number().int().positive().default(1)),
  sort: sortSchema.optional(),
});
