export type SourceMetadata = {
  title: string | null;
  authors: string[];
  year: number | null;
  journalOrPublisher: string | null;
  publisher: string | null;
  doi: string | null;
  url: string | null;
  abstract: string | null;
  sourceType:
    | "journal_article"
    | "book"
    | "website"
    | "report"
    | "thesis"
    | "conference_paper"
    | "other"
    | null;
};

export type SourceMetadataResult =
  | {
      success: true;
      metadata: SourceMetadata;
      lookupType: "doi" | "url";
      resolvedFrom: string;
    }
  | {
      success: false;
      message: string;
    };
