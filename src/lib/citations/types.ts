import type { CitationStyle, SourceType } from "@/types/app";

export type CitationSource = {
  title: string;
  authors: string[];
  year: number | null;
  journalOrPublisher: string | null;
  url: string | null;
  doi: string | null;
  abstract: string | null;
  sourceType: SourceType;
  citationStylePreference: CitationStyle;
};

export type CitationFormatter = (source: CitationSource) => string;

export type CitationStyleDefinition = {
  key: CitationStyle;
  label: string;
  formatter: CitationFormatter;
};
