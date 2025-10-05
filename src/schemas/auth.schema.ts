import z from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(5, "Minimum username is 5 characters")
    .max(20, "Maximium username is 20 characters"),
  email: z.email("Email is invalid"),
  password: z.string().min(8, "Minimum password is 8 characters"),
});

export const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string(),
});
