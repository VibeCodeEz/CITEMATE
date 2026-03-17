import { z } from "zod";

const optionalUrl = z.union([
  z.literal(""),
  z.string().url("Enter a valid URL."),
]);

export const citationStyleSchema = z.enum(["apa", "mla", "chicago"]);
export const sourceTypeSchema = z.enum([
  "journal_article",
  "book",
  "website",
  "report",
  "thesis",
  "conference_paper",
  "other",
]);

export const sourceSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2, "Title is required.").max(300),
  authorsText: z
    .string()
    .trim()
    .min(2, "Add at least one author.")
    .max(4000),
  year: z
    .string()
    .trim()
    .refine((value) => !value || /^\d{4}$/.test(value), "Use a four-digit year.")
    .max(4, "Use a four-digit year.")
    .optional()
    .or(z.literal("")),
  journalOrPublisher: z.string().trim().max(180).optional().or(z.literal("")),
  url: optionalUrl.optional(),
  doi: z.string().trim().max(180).optional().or(z.literal("")),
  tagsText: z.string().trim().max(400).optional().or(z.literal("")),
  abstract: z.string().trim().max(5000).optional().or(z.literal("")),
  sourceType: sourceTypeSchema,
  citationStylePreference: citationStyleSchema,
  subjectIds: z.array(z.string().uuid()).optional(),
});

export type SourceInput = z.input<typeof sourceSchema>;

export const sourceTypeOptions = [
  { value: "journal_article", label: "Journal article" },
  { value: "book", label: "Book" },
  { value: "website", label: "Website" },
  { value: "report", label: "Report" },
  { value: "thesis", label: "Thesis" },
  { value: "conference_paper", label: "Conference paper" },
  { value: "other", label: "Other" },
] as const;

export function parseAuthors(authorsText: string) {
  return authorsText
    .split(/[\n;]+/g)
    .map((author) => author.trim())
    .filter(Boolean);
}

export function parseTags(tagsText?: string) {
  return (tagsText ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function getSourceTypeLabel(sourceType: z.infer<typeof sourceTypeSchema>) {
  return (
    sourceTypeOptions.find((option) => option.value === sourceType)?.label ??
    "Other"
  );
}
