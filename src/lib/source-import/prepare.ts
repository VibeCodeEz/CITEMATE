import { normalizeSourceDoi, parseAuthors, parseTags, sourceSchema } from "@/lib/validations/source";
import { createSourceImportFingerprint } from "@/lib/source-import/csv";
import type { CsvImportServerResultRow, ImportExistingSource } from "@/lib/source-import/types";
import type { SourceInput } from "@/lib/validations/source";

type PreparedImportRow =
  | {
      rowNumber: number;
      ok: true;
      payload: {
        title: string;
        authors: string[];
        year: number | null;
        publisher: string | null;
        url: string | null;
        doi: string | null;
        tags: string[];
        abstract: string | null;
        source_type: SourceInput["sourceType"];
        citation_style: SourceInput["citationStylePreference"];
      };
      fingerprint: string | null;
    }
  | {
      rowNumber: number;
      ok: false;
      message: string;
    };

export function prepareSourceImportRows(args: {
  rows: Array<SourceInput & { rowNumber: number }>;
  existingSources: ImportExistingSource[];
}) {
  const existingFingerprints = new Set(
    args.existingSources
      .map((source) =>
        createSourceImportFingerprint({
          title: source.title,
          authorsText: source.authors.join("; "),
          year: source.year ? String(source.year) : "",
          doi: source.doi,
          url: source.url,
        }),
      )
      .filter((value): value is string => Boolean(value)),
  );
  const importFingerprints = new Set<string>();
  const preparedRows: PreparedImportRow[] = args.rows.map((row) => {
    const parsed = sourceSchema.safeParse({
      ...row,
      subjectIds: [],
    });

    if (!parsed.success) {
      const message =
        Object.values(parsed.error.flatten().fieldErrors).flat().find(Boolean) ??
        "Row validation failed.";

      return {
        rowNumber: row.rowNumber,
        ok: false,
        message,
      };
    }

    const authors = parseAuthors(parsed.data.authorsText);

    if (authors.length === 0) {
      return {
        rowNumber: row.rowNumber,
        ok: false,
        message: "Add at least one author.",
      };
    }

    const fingerprint = createSourceImportFingerprint(parsed.data);

    if (fingerprint && existingFingerprints.has(fingerprint)) {
      return {
        rowNumber: row.rowNumber,
        ok: false,
        message: "Looks like a duplicate of an existing source.",
      };
    }

    if (fingerprint && importFingerprints.has(fingerprint)) {
      return {
        rowNumber: row.rowNumber,
        ok: false,
        message: "Duplicates another row in this import.",
      };
    }

    if (fingerprint) {
      importFingerprints.add(fingerprint);
    }

    return {
      rowNumber: row.rowNumber,
      ok: true,
      fingerprint,
      payload: {
        title: parsed.data.title,
        authors,
        year: parsed.data.year ? Number(parsed.data.year) : null,
        publisher: parsed.data.journalOrPublisher || null,
        url: parsed.data.url || null,
        doi: normalizeSourceDoi(parsed.data.doi) ?? null,
        tags: parseTags(parsed.data.tagsText),
        abstract: parsed.data.abstract || null,
        source_type: parsed.data.sourceType,
        citation_style: parsed.data.citationStylePreference,
      },
    };
  });

  return preparedRows;
}

export function summarizeSourceImportResults(results: CsvImportServerResultRow[]) {
  return {
    imported: results.filter((row) => row.imported).length,
    skipped: results.filter((row) => !row.imported).length,
  };
}
