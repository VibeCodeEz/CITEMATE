import type { SourceWithRelations, SubjectWithCount } from "@/types/app";

export type RelatedStudiesMatrixRow = {
  sourceId: string;
  title: string;
  authors: string;
  year: string;
  sourceType: string;
  method: string;
  sample: string;
  findings: string;
  researchGap: string;
  themes: string[];
};

export type ThemeBoard = {
  theme: string;
  description: string;
  sources: SourceWithRelations[];
};

const genericThemeWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "associated",
  "based",
  "between",
  "by",
  "effect",
  "effects",
  "for",
  "from",
  "identification",
  "in",
  "into",
  "of",
  "on",
  "or",
  "review",
  "study",
  "studies",
  "the",
  "through",
  "to",
  "using",
  "with",
]);

function normalizeText(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function truncateText(value: string | null | undefined, maxLength: number) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return "";
  }

  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength).trimEnd()}...`
    : normalized;
}

function collectSourceText(source: SourceWithRelations) {
  return [
    source.title,
    source.abstract ?? "",
    source.tags.join(" "),
    source.notes.map((note) => note.content).join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

function inferMethodLabel(source: SourceWithRelations) {
  const text = collectSourceText(source);

  if (/(qualitative|interview|focus group|ethnograph)/i.test(text)) {
    return "Qualitative";
  }

  if (/(quantitative|survey|regression|experiment|statistical)/i.test(text)) {
    return "Quantitative";
  }

  if (/(mixed methods|mixed-methods)/i.test(text)) {
    return "Mixed methods";
  }

  if (/(systematic review|meta-analysis|literature review)/i.test(text)) {
    return "Review study";
  }

  return "Not stated";
}

function inferSampleLabel(source: SourceWithRelations) {
  const text = collectSourceText(source);

  if (/(student|college|undergraduate|university)/i.test(text)) {
    return "Students";
  }

  if (/(teacher|faculty|instructor)/i.test(text)) {
    return "Teachers or faculty";
  }

  if (/(patient|clinical|hospital|nursing)/i.test(text)) {
    return "Clinical or patient population";
  }

  if (/(community|household|family|resident)/i.test(text)) {
    return "Community sample";
  }

  return "Not stated";
}

function inferResearchGap(source: SourceWithRelations) {
  const notesText = source.notes.map((note) => note.content).join(" ");
  const text = `${source.abstract ?? ""} ${notesText}`;
  const match = text.match(
    /((gap|limitation|future research|underexplored|little is known)[^.]*\.)/i,
  );

  if (match?.[1]) {
    return truncateText(match[1], 180);
  }

  return "Not stated";
}

function toTitleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) =>
      /^[A-Z0-9-]{2,}$/.test(part)
        ? part
        : `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`,
    )
    .join(" ");
}

function extractTitleThemes(title: string) {
  const rawTokens = title.match(/[A-Za-z0-9-]+/g) ?? [];
  const acronymTokens = rawTokens.filter((token) =>
    /[A-Z]{2,}/.test(token) || /snp/i.test(token) || /indel/i.test(token),
  );
  const descriptiveTokens = rawTokens.filter((token) => {
    const normalized = token.toLowerCase();

    return (
      normalized.length > 2 &&
      !genericThemeWords.has(normalized) &&
      !/^\d+$/.test(normalized) &&
      !/[A-Z]{2,}/.test(token)
    );
  });

  const themes: string[] = [];

  if (acronymTokens.length >= 2) {
    themes.push(`${acronymTokens[0]} and ${acronymTokens[1]}`);
  } else if (acronymTokens.length === 1) {
    themes.push(acronymTokens[0]);
  }

  if (descriptiveTokens.length >= 2) {
    themes.push(toTitleCase(descriptiveTokens.slice(0, 3).join(" ")));
  } else if (descriptiveTokens.length === 1) {
    themes.push(toTitleCase(descriptiveTokens[0]));
  }

  return Array.from(new Set(themes)).slice(0, 3);
}

function getPrimaryThemes(source: SourceWithRelations) {
  if (source.tags.length > 0) {
    return source.tags.slice(0, 3).map((tag) => toTitleCase(tag.replace(/[-_]+/g, " ")));
  }

  const titleThemes = extractTitleThemes(source.title);

  if (titleThemes.length > 0) {
    return titleThemes;
  }

  return [toTitleCase(source.source_type.replace(/_/g, " "))];
}

export function buildRelatedStudiesMatrix(
  sources: SourceWithRelations[],
): RelatedStudiesMatrixRow[] {
  return sources.map((source) => ({
    sourceId: source.id,
    title: source.title,
    authors: source.authors.join(", ") || "Unknown author",
    year: source.year ? String(source.year) : "n.d.",
    sourceType: source.source_type.replace(/_/g, " "),
    method: inferMethodLabel(source),
    sample: inferSampleLabel(source),
    findings:
      truncateText(source.abstract ?? source.notes[0]?.content, 180) || "Not stated",
    researchGap: inferResearchGap(source),
    themes: getPrimaryThemes(source),
  }));
}

export function buildThemeBoards(sources: SourceWithRelations[]): ThemeBoard[] {
  const buckets = new Map<string, SourceWithRelations[]>();

  sources.forEach((source) => {
    const themes = getPrimaryThemes(source);

    themes.forEach((theme) => {
      const label = theme.trim();
      const bucket = buckets.get(label) ?? [];
      bucket.push(source);
      buckets.set(label, bucket);
    });
  });

  return Array.from(buckets.entries())
    .map(([theme, themeSources]) => ({
      theme,
      description:
        themeSources.length === 1
          ? "One source is currently grouped under this theme."
          : `${themeSources.length} sources currently contribute to this theme.`,
      sources: themeSources,
    }))
    .sort((a, b) => b.sources.length - a.sources.length || a.theme.localeCompare(b.theme));
}

function buildMarkdownTable(rows: RelatedStudiesMatrixRow[]) {
  const lines = [
    "| Source | Year | Method | Sample | Findings | Research gap |",
    "| --- | --- | --- | --- | --- | --- |",
  ];

  rows.forEach((row) => {
    lines.push(
      `| ${row.title.replace(/\|/g, "\\|")} | ${row.year} | ${row.method} | ${row.sample} | ${row.findings.replace(/\|/g, "\\|")} | ${row.researchGap.replace(/\|/g, "\\|")} |`,
    );
  });

  return lines.join("\n");
}

export function buildLiteratureReviewMarkdown(args: {
  subject: Pick<SubjectWithCount, "name" | "description">;
  sources: SourceWithRelations[];
}) {
  const rows = buildRelatedStudiesMatrix(args.sources);
  const boards = buildThemeBoards(args.sources).slice(0, 8);
  const date = new Date().toISOString().slice(0, 10);

  return [
    `# ${args.subject.name} Literature Review Pack`,
    "",
    `Exported on ${date}.`,
    "",
    "## Subject overview",
    "",
    args.subject.description || "No subject description provided.",
    "",
    `- Sources: ${args.sources.length}`,
    `- Notes: ${args.sources.reduce((total, source) => total + source.notes.length, 0)}`,
    "",
    "## Theme boards",
    "",
    ...boards.flatMap((board) => [
      `### ${board.theme}`,
      "",
      board.description,
      "",
      ...board.sources.map((source) => `- ${source.title} (${source.year ?? "n.d."})`),
      "",
    ]),
    "## Related studies matrix",
    "",
    buildMarkdownTable(rows),
    "",
    "## Source snapshots",
    "",
    ...args.sources.flatMap((source) => [
      `### ${source.title}`,
      "",
      `- Authors: ${source.authors.join(", ") || "Unknown author"}`,
      `- Year: ${source.year ?? "n.d."}`,
      `- Themes: ${getPrimaryThemes(source).join(", ")}`,
      `- Method: ${inferMethodLabel(source)}`,
      `- Sample: ${inferSampleLabel(source)}`,
      `- Findings: ${truncateText(source.abstract ?? source.notes[0]?.content, 220) || "Not stated"}`,
      `- Research gap: ${inferResearchGap(source)}`,
      "",
    ]),
  ].join("\n");
}
