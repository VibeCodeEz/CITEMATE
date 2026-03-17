import { formatApaCitation } from "@/lib/citations/styles/apa";
import { formatChicagoCitation } from "@/lib/citations/styles/chicago";
import { formatMlaCitation } from "@/lib/citations/styles/mla";
import type {
  CitationSource,
  CitationStyleDefinition,
} from "@/lib/citations/types";
import type { CitationStyle, SourceWithRelations } from "@/types/app";

const citationStyles: CitationStyleDefinition[] = [
  {
    key: "apa",
    label: "APA 7",
    formatter: formatApaCitation,
  },
  {
    key: "mla",
    label: "MLA 9",
    formatter: formatMlaCitation,
  },
  {
    key: "chicago",
    label: "Chicago",
    formatter: formatChicagoCitation,
  },
];

const citationStyleMap = new Map(
  citationStyles.map((style) => [style.key, style]),
);

export function getStyleLabel(style: CitationStyle) {
  return citationStyleMap.get(style)?.label ?? style;
}

export function mapSourceToCitationSource(
  source: Pick<
    SourceWithRelations,
    | "title"
    | "authors"
    | "year"
    | "publisher"
    | "url"
    | "doi"
    | "abstract"
    | "source_type"
    | "citation_style"
  >,
): CitationSource {
  return {
    title: source.title,
    authors: source.authors,
    year: source.year,
    journalOrPublisher: source.publisher,
    url: source.url,
    doi: source.doi,
    abstract: source.abstract,
    sourceType: source.source_type,
    citationStylePreference: source.citation_style,
  };
}

export function generateCitation(
  source: CitationSource,
  style: CitationStyle,
) {
  const styleDefinition = citationStyleMap.get(style);

  if (!styleDefinition) {
    return "";
  }

  return styleDefinition.formatter(source);
}

export function generateCitationPreviewSet(source: CitationSource) {
  return citationStyles.map((style) => ({
    style: style.key,
    label: style.label,
    citation: style.formatter(source),
  }));
}

export function formatCitation(
  source: SourceWithRelations,
  style: CitationStyle,
) {
  return generateCitation(mapSourceToCitationSource(source), style);
}

export { citationStyles };
