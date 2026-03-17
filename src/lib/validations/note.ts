import { z } from "zod";

export const noteSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2, "Note title is required.").max(160),
  content: z.string().trim().min(5, "Add a meaningful note.").max(10000),
  sourceId: z.string().uuid().optional().nullable(),
});

export type NoteInput = z.input<typeof noteSchema>;
