import type { CitationSource } from "@/lib/citations/types";

export function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);

  if (parts.length <= 1) {
    return {
      first: "",
      last: parts[0] ?? "Unknown author",
    };
  }

  return {
    first: parts.slice(0, -1).join(" "),
    last: parts.at(-1) ?? "Unknown author",
  };
}

function getNameInitials(first: string) {
  return first
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .filter(Boolean);
}

export function getDisplayYear(source: CitationSource) {
  return source.year ? String(source.year) : "n.d.";
}

export function getTitle(source: CitationSource) {
  return source.title?.trim() || "Untitled source";
}

export function getPublisher(source: CitationSource) {
  return source.journalOrPublisher?.trim() || "";
}

export function getResolvableLink(source: CitationSource) {
  if (source.doi?.trim()) {
    return source.doi.startsWith("http")
      ? source.doi.trim()
      : `https://doi.org/${source.doi.replace(/^doi:\s*/i, "").trim()}`;
  }

  return source.url?.trim() || "";
}

export function formatApaAuthors(authors: string[]) {
  if (authors.length === 0) return "Unknown author";

  const formatted = authors.map((author) => {
    const { first, last } = splitName(author);
    const initials = first
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => `${part[0]?.toUpperCase()}.`)
      .join(" ");

    return `${last}, ${initials}`.trim();
  });

  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]} & ${formatted[1]}`;

  return `${formatted.slice(0, -1).join(", ")}, & ${formatted.at(-1)}`;
}

export function formatReadableAuthors(authors: string[]) {
  if (authors.length === 0) return "Unknown author";
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;

  return `${authors.slice(0, -1).join(", ")}, and ${authors.at(-1)}`;
}

export function formatSurnameInitialsAuthors(
  authors: string[],
  options?: {
    separator?: string;
    finalSeparator?: string;
    maxAuthors?: number;
    initialsCompact?: boolean;
    nameJoiner?: string;
  },
) {
  if (authors.length === 0) return "Unknown author";

  const {
    separator = ", ",
    finalSeparator = ", and ",
    maxAuthors,
    initialsCompact = false,
    nameJoiner = ", ",
  } = options ?? {};
  const selected =
    typeof maxAuthors === "number" ? authors.slice(0, maxAuthors) : authors;

  const formatted = selected.map((author) => {
    const { first, last } = splitName(author);
    const initials = getNameInitials(first)
      .map((initial) => (initialsCompact ? `${initial}` : `${initial}.`))
      .join(initialsCompact ? "" : " ");

    return `${last}${initials ? `${nameJoiner}${initials}` : ""}`.trim();
  });

  if (authors.length > selected.length) {
    formatted.push("et al.");
  }

  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]}${finalSeparator}${formatted[1]}`;

  return `${formatted.slice(0, -1).join(separator)}${finalSeparator}${formatted.at(-1)}`;
}

export function formatTitleCase(title: string) {
  return getTitle({
    title,
    authors: [],
    year: null,
    journalOrPublisher: null,
    url: null,
    doi: null,
    abstract: null,
    sourceType: "other",
    citationStylePreference: "apa",
  });
}

export function formatNumericStyleCitation(args: {
  source: CitationSource;
  prefix: string;
  titleQuotes?: boolean;
  yearBeforePublisher?: boolean;
  authorStyle?: "readable" | "surname-initials";
}) {
  const { source, prefix, titleQuotes = false, yearBeforePublisher = false, authorStyle = "surname-initials" } = args;
  const authors =
    authorStyle === "readable"
      ? formatReadableAuthors(source.authors)
      : formatSurnameInitialsAuthors(source.authors, {
          finalSeparator: ", ",
          initialsCompact: true,
          nameJoiner: " ",
        });
  const title = getTitle(source);
  const publisher = getPublisher(source);
  const year = getDisplayYear(source);
  const link = getResolvableLink(source);
  const titleSegment = titleQuotes ? `"${title}."` : `${title}.`;

  return joinCitationParts([
    prefix,
    `${authors}.`,
    titleSegment,
    yearBeforePublisher && year !== "n.d." ? `${year}.` : undefined,
    publisher ? `${publisher}.` : undefined,
    !yearBeforePublisher ? `${year}.` : undefined,
    link,
  ]);
}

export function joinCitationParts(parts: Array<string | undefined>) {
  return parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
