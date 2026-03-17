import { getResolvableLink, getTitle, splitName } from "@/lib/citations/utils";
import type { CitationSource } from "@/lib/citations/types";
import type {
  CitationExportDocument,
  CitationExportFormat,
  CitationExportSource,
} from "@/lib/citation-export/types";
import type { SourceWithRelations } from "@/types/app";

function toCitationSource(source: CitationExportSource): CitationSource {
  return {
    title: source.title,
    authors: source.authors,
    year: source.year,
    journalOrPublisher: source.publisher,
    url: source.url,
    doi: source.doi,
    abstract: source.abstract,
    sourceType: source.sourceType,
    citationStylePreference: "apa",
  };
}

function normalizeText(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() || "";
}

function escapeBibTeXValue(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/[{}]/g, "\\$&")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function getPrimaryAuthorKey(source: CitationExportSource) {
  const author = source.authors[0];

  if (!author) {
    return "unknown";
  }

  return slugify(splitName(author).last || author) || "unknown";
}

function getTitleKey(source: CitationExportSource) {
  const citationSource = toCitationSource(source);
  const title = getTitle(citationSource);
  const words = title.split(/\s+/).filter(Boolean);

  return slugify(words.slice(0, 2).join("-")) || "source";
}

function createBaseBibTeXKey(source: CitationExportSource) {
  return [getPrimaryAuthorKey(source), source.year ?? "nd", getTitleKey(source)]
    .filter(Boolean)
    .join("-");
}

function createUniqueBibTeXKey(
  source: CitationExportSource,
  usedKeys: Map<string, number>,
) {
  const baseKey = createBaseBibTeXKey(source);
  const count = usedKeys.get(baseKey) ?? 0;
  usedKeys.set(baseKey, count + 1);

  return count === 0 ? baseKey : `${baseKey}-${count + 1}`;
}

function getBibTeXEntryType(source: CitationExportSource) {
  switch (source.sourceType) {
    case "journal_article":
      return "article";
    case "book":
      return "book";
    case "conference_paper":
      return "inproceedings";
    case "report":
      return "techreport";
    case "thesis":
      return "phdthesis";
    case "website":
      return "misc";
    default:
      return "misc";
  }
}

function formatBibTeXAuthors(authors: string[]) {
  if (authors.length === 0) {
    return "";
  }

  return authors
    .map((author) => {
      const { first, last } = splitName(author);
      return first ? `${last}, ${first}` : last;
    })
    .join(" and ");
}

function getPublisherFieldName(source: CitationExportSource) {
  switch (source.sourceType) {
    case "journal_article":
      return "journal";
    case "conference_paper":
      return "booktitle";
    case "report":
      return "institution";
    case "thesis":
      return "school";
    default:
      return "publisher";
  }
}

export function mapSourceToCitationExportSource(
  source: Pick<
    SourceWithRelations,
    | "id"
    | "title"
    | "authors"
    | "year"
    | "publisher"
    | "url"
    | "doi"
    | "abstract"
    | "tags"
    | "source_type"
  >,
): CitationExportSource {
  return {
    id: source.id,
    title: source.title,
    authors: source.authors,
    year: source.year,
    publisher: source.publisher,
    url: source.url,
    doi: source.doi,
    abstract: source.abstract,
    tags: source.tags,
    sourceType: source.source_type,
  };
}

export function formatBibTeXEntry(
  source: CitationExportSource,
  usedKeys: Map<string, number> = new Map(),
) {
  const citationSource = toCitationSource(source);
  const key = createUniqueBibTeXKey(source, usedKeys);
  const fields: Array<[string, string]> = [];
  const title = getTitle(citationSource);
  const authors = formatBibTeXAuthors(source.authors);
  const publisher = normalizeText(source.publisher);
  const url = normalizeText(getResolvableLink(citationSource));
  const abstract = normalizeText(source.abstract);
  const keywords = source.tags
    .map((tag) => normalizeText(tag))
    .filter(Boolean)
    .join(", ");

  fields.push(["title", title]);

  if (authors) {
    fields.push(["author", authors]);
  }

  if (source.year) {
    fields.push(["year", String(source.year)]);
  }

  if (publisher) {
    fields.push([getPublisherFieldName(source), publisher]);
  }

  if (source.doi) {
    fields.push(["doi", normalizeText(source.doi)]);
  }

  if (url) {
    fields.push(["url", url]);
  }

  if (abstract) {
    fields.push(["abstract", abstract]);
  }

  if (keywords) {
    fields.push(["keywords", keywords]);
  }

  const formattedFields = fields
    .map(
      ([fieldName, value]) => `  ${fieldName} = {${escapeBibTeXValue(value)}}`,
    )
    .join(",\n");

  return `@${getBibTeXEntryType(source)}{${key},\n${formattedFields}\n}`;
}

function getRisType(source: CitationExportSource) {
  switch (source.sourceType) {
    case "journal_article":
      return "JOUR";
    case "book":
      return "BOOK";
    case "conference_paper":
      return "CONF";
    case "report":
      return "RPRT";
    case "thesis":
      return "THES";
    case "website":
      return "ELEC";
    default:
      return "GEN";
  }
}

function addRisField(lines: string[], tag: string, value: string | null | undefined) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return;
  }

  lines.push(`${tag}  - ${normalized}`);
}

export function formatRisEntry(source: CitationExportSource) {
  const citationSource = toCitationSource(source);
  const lines = [`TY  - ${getRisType(source)}`];

  addRisField(lines, "TI", getTitle(citationSource));
  source.authors.forEach((author) => addRisField(lines, "AU", author));

  if (source.year) {
    lines.push(`PY  - ${source.year}`);
  }

  switch (source.sourceType) {
    case "journal_article":
      addRisField(lines, "JO", source.publisher);
      break;
    case "conference_paper":
      addRisField(lines, "BT", source.publisher);
      break;
    default:
      addRisField(lines, "PB", source.publisher);
      break;
  }

  addRisField(lines, "DO", source.doi);
  addRisField(lines, "UR", getResolvableLink(citationSource));
  addRisField(lines, "AB", source.abstract);
  source.tags.forEach((tag) => addRisField(lines, "KW", tag));
  lines.push("ER  -");

  return lines.join("\n");
}

export function formatBibTeX(sources: CitationExportSource[]) {
  const usedKeys = new Map<string, number>();

  return sources.map((source) => formatBibTeXEntry(source, usedKeys)).join("\n\n");
}

export function formatRis(sources: CitationExportSource[]) {
  return sources.map((source) => formatRisEntry(source)).join("\n\n");
}

function formatDateSegment(value: Date) {
  return value.toISOString().slice(0, 10);
}

function buildExportFileName(
  sources: CitationExportSource[],
  extension: "bib" | "ris",
  now: Date,
) {
  if (sources.length === 1) {
    const singleTitle = slugify(getTitle(toCitationSource(sources[0])));
    return `${singleTitle || "source"}.${extension}`;
  }

  return `citemate-sources-${formatDateSegment(now)}.${extension}`;
}

export function buildCitationExportDocument(
  sources: CitationExportSource[],
  format: CitationExportFormat,
  now: Date = new Date(),
): CitationExportDocument {
  const content = format === "bibtex" ? formatBibTeX(sources) : formatRis(sources);
  const extension = format === "bibtex" ? "bib" : "ris";

  return {
    format,
    content,
    fileName: buildExportFileName(sources, extension, now),
    mimeType: "text/plain;charset=utf-8",
    extension,
    sourceCount: sources.length,
  };
}
