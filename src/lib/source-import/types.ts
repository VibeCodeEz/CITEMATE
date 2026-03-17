import type { CitationStyle, SourceType, SourceWithRelations } from "@/types/app";

export type CsvSourceField =
  | "title"
  | "authorsText"
  | "year"
  | "journalOrPublisher"
  | "url"
  | "doi"
  | "tagsText"
  | "abstract"
  | "sourceType"
  | "citationStylePreference";

export type CsvFieldMapping = Partial<Record<CsvSourceField, string>>;

export type ParsedCsv = {
  headers: string[];
  rows: Array<Record<string, string>>;
};

export type CsvImportDefaults = {
  sourceType: SourceType;
  citationStylePreference: CitationStyle;
};

export type ImportExistingSource = Pick<
  SourceWithRelations,
  "id" | "title" | "authors" | "year" | "doi" | "url"
>;

export type CsvImportPreviewRow = {
  rowNumber: number;
  mappedValues: {
    title: string;
    authorsText: string;
    year: string;
    journalOrPublisher: string;
    url: string;
    doi: string;
    tagsText: string;
    abstract: string;
    sourceType: SourceType;
    citationStylePreference: CitationStyle;
  };
  errors: string[];
  warnings: string[];
  duplicateFingerprint: string | null;
  duplicateOfExisting: boolean;
  duplicateInFile: boolean;
  readyToImport: boolean;
};

export type CsvImportPreview = {
  rows: CsvImportPreviewRow[];
  summary: {
    total: number;
    ready: number;
    invalid: number;
    duplicates: number;
    warnings: number;
  };
};

export type CsvImportServerResultRow = {
  rowNumber: number;
  imported: boolean;
  message: string;
  sourceId?: string;
};
