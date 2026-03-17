import type { SourceType } from "@/types/app";

export type CitationExportFormat = "bibtex" | "ris";

export type CitationExportSource = {
  id: string;
  title: string;
  authors: string[];
  year: number | null;
  publisher: string | null;
  url: string | null;
  doi: string | null;
  abstract: string | null;
  tags: string[];
  sourceType: SourceType;
};

export type CitationExportDocument = {
  format: CitationExportFormat;
  content: string;
  fileName: string;
  mimeType: string;
  extension: "bib" | "ris";
  sourceCount: number;
};
