import { formatAcsCitation } from "@/lib/citations/styles/acs";
import { formatAmaCitation } from "@/lib/citations/styles/ama";
import { formatApaCitation } from "@/lib/citations/styles/apa";
import { formatApsaCitation } from "@/lib/citations/styles/apsa";
import { formatAsaCitation } from "@/lib/citations/styles/asa";
import { formatBluebookCitation } from "@/lib/citations/styles/bluebook";
import { formatChicagoCitation } from "@/lib/citations/styles/chicago";
import { formatCseCitation } from "@/lib/citations/styles/cse";
import { formatHarvardCitation } from "@/lib/citations/styles/harvard";
import { formatIeeeCitation } from "@/lib/citations/styles/ieee";
import { formatMlaCitation } from "@/lib/citations/styles/mla";
import { formatNlmCitation } from "@/lib/citations/styles/nlm";
import { formatOscolaCitation } from "@/lib/citations/styles/oscola";
import { formatTurabianCitation } from "@/lib/citations/styles/turabian";
import { formatVancouverCitation } from "@/lib/citations/styles/vancouver";
import type {
  CitationSource,
  CitationStyleDefinition,
} from "@/lib/citations/types";
import { citationStyleOptions } from "@/lib/validations/source";
import type { CitationStyle, SourceWithRelations } from "@/types/app";

const citationFormatterMap: Record<CitationStyle, CitationStyleDefinition["formatter"]> = {
  apa: formatApaCitation,
  mla: formatMlaCitation,
  chicago: formatChicagoCitation,
  harvard: formatHarvardCitation,
  ieee: formatIeeeCitation,
  ama: formatAmaCitation,
  vancouver: formatVancouverCitation,
  turabian: formatTurabianCitation,
  acs: formatAcsCitation,
  cse: formatCseCitation,
  oscola: formatOscolaCitation,
  bluebook: formatBluebookCitation,
  asa: formatAsaCitation,
  apsa: formatApsaCitation,
  nlm: formatNlmCitation,
};

const citationStyles: CitationStyleDefinition[] = citationStyleOptions.map((style) => ({
  key: style.value,
  label: style.label,
  formatter: citationFormatterMap[style.value],
}));

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
