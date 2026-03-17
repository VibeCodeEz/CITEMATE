import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Enter a valid college email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(2, "Full name is required.").max(120),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
