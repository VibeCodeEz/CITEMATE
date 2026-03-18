import { z } from "zod";

export const assistantTaskTypeSchema = z.enum([
  "summarize_source",
  "suggest_missing_metadata",
  "explain_citation",
  "notes_to_outline",
  "rewrite_notes",
  "generate_study_questions",
  "resolve_reminder",
]);

export const assistantRequestSchema = z.object({
  taskType: assistantTaskTypeSchema,
  sourceContext: z
    .object({
      id: z.string(),
      title: z.string(),
      authors: z.array(z.string()),
      year: z.number().nullable(),
      journalOrPublisher: z.string().nullable(),
      url: z.string().nullable(),
      doi: z.string().nullable(),
      abstract: z.string().nullable(),
      sourceType: z.string(),
      citationStylePreference: z.string(),
      tags: z.array(z.string()),
      subjectLabels: z.array(z.string()),
    })
    .optional(),
  noteContext: z
    .object({
      id: z.string().optional(),
      title: z.string(),
      content: z.string(),
    })
    .optional(),
  subjectContext: z
    .object({
      id: z.string().optional(),
      name: z.string(),
      description: z.string().nullable().optional(),
    })
    .optional(),
  reminderContext: z
    .object({
      key: z.string(),
      title: z.string(),
      description: z.string(),
      missingFields: z.array(z.string()),
      sourceTitle: z.string().optional(),
    })
    .optional(),
  userMessage: z.string().trim().max(1000).optional(),
});

export const assistantResponseSchema = z.object({
  title: z.string().min(1).max(140),
  content: z.string().min(1).max(5000),
  suggestions: z
    .array(
      z.object({
        label: z.string().min(1).max(80),
        value: z.string().min(1).max(1000),
        reason: z.string().max(240).optional(),
      }),
    )
    .max(8)
    .default([]),
  warnings: z.array(z.string().min(1).max(240)).max(8).default([]),
  applyActions: z
    .array(
      z.object({
        type: z.enum(["copy", "insert_into_note", "use_as_draft", "dismiss"]),
        label: z.string().min(1).max(60),
      }),
    )
    .max(6)
    .optional(),
  disclaimer: z.string().min(1).max(240),
});

export type AssistantRequestInput = z.infer<typeof assistantRequestSchema>;
export type AssistantResponseOutput = z.infer<typeof assistantResponseSchema>;
