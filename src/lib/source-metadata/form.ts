import type { SourceMetadata } from "@/lib/source-metadata/types";
import type { SourceInput } from "@/lib/validations/source";

export type SourceMetadataField =
  | "title"
  | "authorsText"
  | "year"
  | "journalOrPublisher"
  | "doi"
  | "url"
  | "abstract"
  | "sourceType";

export type SourceMetadataDirtyFields = Partial<
  Record<SourceMetadataField, boolean>
>;

export function metadataToSourceFormValues(metadata: SourceMetadata) {
  const values: Partial<SourceInput> = {
    title: metadata.title ?? undefined,
    authorsText:
      metadata.authors.length > 0 ? metadata.authors.join("; ") : undefined,
    year: metadata.year ? String(metadata.year) : undefined,
    journalOrPublisher:
      metadata.journalOrPublisher ?? metadata.publisher ?? undefined,
    doi: metadata.doi ?? undefined,
    url: metadata.url ?? undefined,
    abstract: metadata.abstract ?? undefined,
    sourceType: metadata.sourceType ?? undefined,
  };

  return values;
}

function normalizeValue(value: unknown) {
  if (typeof value === "string") {
    return value.trim();
  }

  return value ?? null;
}

export function mergeMetadataIntoSourceForm(
  currentValues: SourceInput,
  fetchedValues: Partial<SourceInput>,
  dirtyFields: SourceMetadataDirtyFields,
  overwriteDirty = false,
) {
  const nextValues: Partial<SourceInput> = {};
  const conflictingFields: SourceMetadataField[] = [];
  const appliedFields: SourceMetadataField[] = [];
  const fieldNames = Object.keys(fetchedValues) as SourceMetadataField[];

  fieldNames.forEach((fieldName) => {
    const fetchedValue = fetchedValues[fieldName];

    if (fetchedValue === undefined || fetchedValue === null || fetchedValue === "") {
      return;
    }

    const currentValue = currentValues[fieldName];
    const normalizedCurrent = normalizeValue(currentValue);
    const normalizedFetched = normalizeValue(fetchedValue);

    if (normalizedCurrent === normalizedFetched) {
      return;
    }

    if (dirtyFields[fieldName] && !overwriteDirty) {
      conflictingFields.push(fieldName);
      return;
    }

    nextValues[fieldName] = fetchedValue as never;
    appliedFields.push(fieldName);
  });

  return {
    nextValues,
    conflictingFields,
    appliedFields,
  };
}
