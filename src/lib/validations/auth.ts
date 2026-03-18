import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Enter a valid college email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(2, "Full name is required.").max(120),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export const passwordUpdateSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().min(8, "Confirm your new password."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export const deleteAccountSchema = z.object({
  confirmation: z.string().trim().refine((value) => value === "DELETE", {
    message: "Type DELETE to confirm account deletion.",
  }),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordUpdateInput = z.infer<typeof passwordUpdateSchema>;
export type DeleteAccountFormInput = z.input<typeof deleteAccountSchema>;
export type DeleteAccountInput = z.output<typeof deleteAccountSchema>;
