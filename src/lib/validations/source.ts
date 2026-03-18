import { z } from "zod";

const optionalUrl = z.union([
  z.literal(""),
  z.string().url("Enter a valid URL."),
]);
const DOI_PATTERN = /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;

export function normalizeSourceDoi(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  try {
    const parsed = new URL(trimmed);

    if (parsed.hostname.includes("doi.org")) {
      return normalizeSourceDoi(decodeURIComponent(parsed.pathname.replace(/^\/+/, "")));
    }
  } catch {
    // Treat the value as a DOI string below.
  }

  const normalized = trimmed.replace(/^doi:\s*/i, "");

  return DOI_PATTERN.test(normalized) ? normalized : null;
}

const optionalDoi = z
  .string()
  .trim()
  .max(180)
  .refine((value) => !value || Boolean(normalizeSourceDoi(value)), "Enter a valid DOI.")
  .optional()
  .or(z.literal(""));

export const citationStyleSchema = z.enum([
  "apa",
  "mla",
  "chicago",
  "harvard",
  "ieee",
  "ama",
  "vancouver",
  "turabian",
  "acs",
  "cse",
  "oscola",
  "bluebook",
  "asa",
  "apsa",
  "nlm",
]);
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
  doi: optionalDoi,
  tagsText: z.string().trim().max(400).optional().or(z.literal("")),
  abstract: z.string().trim().max(5000).optional().or(z.literal("")),
  sourceType: sourceTypeSchema,
  citationStylePreference: citationStyleSchema,
  subjectIds: z.array(z.string().uuid()).optional(),
});

export type SourceInput = z.input<typeof sourceSchema>;

export const sourceMetadataLookupSchema = z
  .object({
    doi: optionalDoi,
    url: optionalUrl.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.doi || value.url) {
      return;
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Enter a DOI or URL to fetch metadata.",
      path: ["doi"],
    });
  });

export type SourceMetadataLookupInput = z.input<typeof sourceMetadataLookupSchema>;

export const sourceTypeOptions = [
  { value: "journal_article", label: "Journal article" },
  { value: "book", label: "Book" },
  { value: "website", label: "Website" },
  { value: "report", label: "Report" },
  { value: "thesis", label: "Thesis" },
  { value: "conference_paper", label: "Conference paper" },
  { value: "other", label: "Other" },
] as const;

export const citationStyleOptions = [
  { value: "apa", label: "APA 7" },
  { value: "mla", label: "MLA 9" },
  { value: "chicago", label: "Chicago" },
  { value: "harvard", label: "Harvard" },
  { value: "ieee", label: "IEEE" },
  { value: "ama", label: "AMA" },
  { value: "vancouver", label: "Vancouver" },
  { value: "turabian", label: "Turabian" },
  { value: "acs", label: "ACS" },
  { value: "cse", label: "CSE" },
  { value: "oscola", label: "OSCOLA" },
  { value: "bluebook", label: "Bluebook" },
  { value: "asa", label: "ASA" },
  { value: "apsa", label: "APSA" },
  { value: "nlm", label: "NLM" },
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
