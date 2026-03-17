import type {
  CsvFieldMapping,
  CsvImportDefaults,
  CsvImportPreview,
  CsvImportPreviewRow,
  ImportExistingSource,
  ParsedCsv,
} from "@/lib/source-import/types";
import { normalizeSourceDoi, sourceSchema } from "@/lib/validations/source";

const CSV_FIELD_ALIASES: Record<string, Array<keyof CsvFieldMapping>> = {
  title: ["title"],
  articletitle: ["title"],
  sourcetitle: ["title"],
  authors: ["authorsText"],
  author: ["authorsText"],
  creators: ["authorsText"],
  year: ["year"],
  date: ["year"],
  publicationyear: ["year"],
  journal: ["journalOrPublisher"],
  publisher: ["journalOrPublisher"],
  website: ["journalOrPublisher"],
  sitename: ["journalOrPublisher"],
  journalorpublisher: ["journalOrPublisher"],
  url: ["url"],
  link: ["url"],
  doi: ["doi"],
  tags: ["tagsText"],
  keywords: ["tagsText"],
  abstract: ["abstract"],
  sourcetype: ["sourceType"],
  type: ["sourceType"],
  citationstyle: ["citationStylePreference"],
  style: ["citationStylePreference"],
};

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function parseCsvRows(text: string) {
  const rows: string[][] = [];
  const currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        index += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = "";
      continue;
    }

    if (char === "\n" && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = "";

      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push([...currentRow]);
      }

      currentRow.length = 0;
      continue;
    }

    if (char !== "\r") {
      currentCell += char;
    }
  }

  currentRow.push(currentCell.trim());

  if (currentRow.some((cell) => cell.length > 0)) {
    rows.push(currentRow);
  }

  return rows;
}

export function parseCsv(text: string): ParsedCsv {
  const normalizedText = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const parsedRows = parseCsvRows(normalizedText);

  if (parsedRows.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parsedRows[0].map((header, index) =>
    header || `Column ${index + 1}`,
  );

  const rows = parsedRows.slice(1).map((values) => {

    return headers.reduce<Record<string, string>>((record, header, index) => {
      record[header] = values[index] ?? "";
      return record;
    }, {});
  });

  return { headers, rows };
}

export function inferCsvFieldMapping(headers: string[]): CsvFieldMapping {
  const mapping: CsvFieldMapping = {};

  headers.forEach((header) => {
    const normalized = normalizeHeader(header);
    const matchedFields = CSV_FIELD_ALIASES[normalized] ?? [];

    matchedFields.forEach((fieldName) => {
      if (!mapping[fieldName]) {
        mapping[fieldName] = header;
      }
    });
  });

  return mapping;
}

function normalizeUrl(value?: string | null) {
  if (!value) return null;

  try {
    return new URL(value.trim()).toString().toLowerCase();
  } catch {
    return null;
  }
}

function normalizeTitle(value?: string | null) {
  return value?.trim().toLowerCase().replace(/\s+/g, " ") || null;
}

function normalizeAuthor(value?: string | null) {
  return value?.trim().toLowerCase().replace(/\s+/g, " ") || null;
}

function createFallbackFingerprint({
  title,
  authorsText,
  year,
}: {
  title?: string;
  authorsText?: string;
  year?: string;
}) {
  const normalizedTitle = normalizeTitle(title);
  const firstAuthor = normalizeAuthor(
    (authorsText ?? "").split(/[\n;]+/g).map((author) => author.trim()).filter(Boolean)[0],
  );
  const normalizedYear = year?.trim() || null;

  if (!normalizedTitle) {
    return null;
  }

  return [
    "fallback",
    normalizedTitle,
    firstAuthor ?? "unknown-author",
    normalizedYear ?? "nd",
  ].join(":");
}

export function createSourceImportFingerprint(input: {
  title?: string | null;
  authorsText?: string | null;
  year?: string | null;
  doi?: string | null;
  url?: string | null;
}) {
  const normalizedDoi = normalizeSourceDoi(input.doi);

  if (normalizedDoi) {
    return `doi:${normalizedDoi.toLowerCase()}`;
  }

  const normalizedUrl = normalizeUrl(input.url);

  if (normalizedUrl) {
    return `url:${normalizedUrl}`;
  }

  return createFallbackFingerprint({
    title: input.title ?? "",
    authorsText: input.authorsText ?? "",
    year: input.year ?? "",
  });
}

function mapCsvRow(
  row: Record<string, string>,
  mapping: CsvFieldMapping,
  defaults: CsvImportDefaults,
) {
  const getValue = (fieldName: keyof CsvFieldMapping) =>
    (mapping[fieldName] ? row[mapping[fieldName]!] ?? "" : "").trim();

  return {
    title: getValue("title"),
    authorsText: getValue("authorsText"),
    year: getValue("year"),
    journalOrPublisher: getValue("journalOrPublisher"),
    url: getValue("url"),
    doi: getValue("doi"),
    tagsText: getValue("tagsText"),
    abstract: getValue("abstract"),
    sourceType: (getValue("sourceType") as CsvImportPreviewRow["mappedValues"]["sourceType"]) ||
      defaults.sourceType,
    citationStylePreference:
      (getValue(
        "citationStylePreference",
      ) as CsvImportPreviewRow["mappedValues"]["citationStylePreference"]) ||
      defaults.citationStylePreference,
  };
}

function getValidationMessages(mappedValues: CsvImportPreviewRow["mappedValues"]) {
  const parsed = sourceSchema.safeParse({
    ...mappedValues,
    subjectIds: [],
  });

  if (parsed.success) {
    return [];
  }

  return Object.values(parsed.error.flatten().fieldErrors)
    .flat()
    .filter((message): message is string => Boolean(message));
}

function buildExistingFingerprintSet(existingSources: ImportExistingSource[]) {
  return new Set(
    existingSources
      .map((source) =>
        createSourceImportFingerprint({
          title: source.title,
          authorsText: source.authors.join("; "),
          year: source.year ? String(source.year) : "",
          doi: source.doi,
          url: source.url,
        }),
      )
      .filter((fingerprint): fingerprint is string => Boolean(fingerprint)),
  );
}

export function buildCsvImportPreview(args: {
  parsedCsv: ParsedCsv;
  mapping: CsvFieldMapping;
  defaults: CsvImportDefaults;
  existingSources: ImportExistingSource[];
}): CsvImportPreview {
  const { defaults, existingSources, mapping, parsedCsv } = args;
  const existingFingerprints = buildExistingFingerprintSet(existingSources);
  const previewRows = parsedCsv.rows.map<CsvImportPreviewRow>((row, rowIndex) => {
    const mappedValues = mapCsvRow(row, mapping, defaults);
    const errors = getValidationMessages(mappedValues);
    const warnings: string[] = [];
    const duplicateFingerprint = createSourceImportFingerprint(mappedValues);

    if (!mappedValues.year) {
      warnings.push("Missing publication year.");
    }

    if (!mappedValues.journalOrPublisher) {
      warnings.push("Missing journal or publisher.");
    }

    const duplicateOfExisting =
      duplicateFingerprint !== null && existingFingerprints.has(duplicateFingerprint);

    return {
      rowNumber: rowIndex + 2,
      mappedValues,
      errors: duplicateOfExisting
        ? [...errors, "Looks like a duplicate of an existing source."]
        : errors,
      warnings,
      duplicateFingerprint,
      duplicateOfExisting,
      duplicateInFile: false,
      readyToImport: false,
    };
  });

  const seenPreviewFingerprints = new Map<string, number>();

  previewRows.forEach((row) => {
    if (!row.duplicateFingerprint) {
      return;
    }

    const currentCount = seenPreviewFingerprints.get(row.duplicateFingerprint) ?? 0;
    seenPreviewFingerprints.set(row.duplicateFingerprint, currentCount + 1);
  });

  const rows = previewRows.map((row) => {
    const duplicateInFile =
      row.duplicateFingerprint !== null &&
      (seenPreviewFingerprints.get(row.duplicateFingerprint) ?? 0) > 1;
    const errors = duplicateInFile
      ? [...row.errors, "This row duplicates another row in this CSV."]
      : row.errors;

    return {
      ...row,
      duplicateInFile,
      errors,
      readyToImport: errors.length === 0,
    };
  });

  return {
    rows,
    summary: {
      total: rows.length,
      ready: rows.filter((row) => row.readyToImport).length,
      invalid: rows.filter((row) => row.errors.length > 0).length,
      duplicates: rows.filter(
        (row) => row.duplicateOfExisting || row.duplicateInFile,
      ).length,
      warnings: rows.filter((row) => row.warnings.length > 0).length,
    },
  };
}
