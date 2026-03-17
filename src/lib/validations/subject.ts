import { z } from "zod";

export const subjectSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Subject name is required.").max(80),
  description: z.string().trim().max(240).optional().or(z.literal("")),
  color: z.string().regex(/^#([0-9a-fA-F]{6})$/, "Choose a valid color."),
});

export type SubjectInput = z.input<typeof subjectSchema>;
