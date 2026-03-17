"use server";

import { revalidatePath } from "next/cache";

import {
  errorResult,
  successResult,
  type ActionResult,
} from "@/lib/action-result";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  parseAuthors,
  parseTags,
  sourceMetadataLookupSchema,
  sourceSchema,
  normalizeSourceDoi,
  type SourceInput,
} from "@/lib/validations/source";
import { fetchSourceMetadata } from "@/lib/source-metadata/fetch";
import { prepareSourceImportRows, summarizeSourceImportResults } from "@/lib/source-import/prepare";
import type { CsvImportServerResultRow } from "@/lib/source-import/types";
import type { SourceMetadata } from "@/lib/source-metadata/types";

type SourceActionData = {
  sourceId?: string;
};

type SourceMetadataActionData = {
  metadata: SourceMetadata;
  lookupType: "doi" | "url";
  resolvedFrom: string;
};

type ImportSourcesActionData = {
  results: CsvImportServerResultRow[];
  imported: number;
  skipped: number;
};

function revalidateSourceViews(sourceId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/sources");
  revalidatePath("/dashboard/notes");

  if (sourceId) {
    revalidatePath(`/dashboard/sources/${sourceId}`);
  }
}

export async function upsertSourceAction(
  values: SourceInput,
): Promise<ActionResult<SourceActionData>> {
  const parsed = sourceSchema.safeParse(values);

  if (!parsed.success) {
    return errorResult(
      "Please correct the source details.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const authors = parseAuthors(parsed.data.authorsText);

  if (authors.length === 0) {
    return errorResult("Add at least one author.", {
      authorsText: ["Add at least one author."],
    });
  }

  const payload = {
    user_id: user.id,
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
  };

  let sourceId = parsed.data.id;

  if (sourceId) {
    const { error } = await supabase
      .from("sources")
      .update(payload)
      .eq("id", sourceId)
      .eq("user_id", user.id);

    if (error) {
      return errorResult(error.message);
    }

    const { error: deleteLinksError } = await supabase
      .from("source_subjects")
      .delete()
      .eq("source_id", sourceId)
      .eq("user_id", user.id);

    if (deleteLinksError) {
      return errorResult(deleteLinksError.message);
    }
  } else {
    const { data, error } = await supabase
      .from("sources")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      return errorResult(error.message);
    }

    sourceId = data.id;
  }

  if ((parsed.data.subjectIds?.length ?? 0) > 0 && sourceId) {
    const { error } = await supabase.from("source_subjects").insert(
      parsed.data.subjectIds!.map((subjectId) => ({
        source_id: sourceId,
        subject_id: subjectId,
        user_id: user.id,
      })),
    );

    if (error) {
      return errorResult(error.message);
    }
  }

  revalidateSourceViews(sourceId);

  return successResult(
    parsed.data.id ? "Source updated." : "Source saved.",
    { sourceId },
  );
}

export async function fetchSourceMetadataAction(
  values: {
    doi?: string;
    url?: string;
  },
): Promise<ActionResult<SourceMetadataActionData>> {
  const parsed = sourceMetadataLookupSchema.safeParse(values);

  if (!parsed.success) {
    return errorResult(
      "Enter a valid DOI or URL to fetch metadata.",
      parsed.error.flatten().fieldErrors,
    );
  }

  await requireUser();

  const result = await fetchSourceMetadata({
    doi: normalizeSourceDoi(parsed.data.doi) ?? parsed.data.doi,
    url: parsed.data.url,
  });

  if (!result.success) {
    return errorResult(result.message);
  }

  return successResult("Metadata fetched.", {
    metadata: result.metadata,
    lookupType: result.lookupType,
    resolvedFrom: result.resolvedFrom,
  });
}

export async function deleteSourceAction(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: source, error: sourceError } = await supabase
    .from("sources")
    .select("file_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (sourceError) {
    return errorResult(sourceError.message);
  }

  if (source?.file_path) {
    await supabase.storage.from("source-files").remove([source.file_path]);
  }

  const { error } = await supabase
    .from("sources")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return errorResult(error.message);
  }

  revalidateSourceViews(id);

  return successResult("Source deleted.");
}

export async function importSourcesAction(
  rows: Array<SourceInput & { rowNumber: number }>,
): Promise<ActionResult<ImportSourcesActionData>> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: existingSources, error: existingSourcesError } = await supabase
    .from("sources")
    .select("id,title,authors,year,doi,url")
    .eq("user_id", user.id);

  if (existingSourcesError) {
    return errorResult(existingSourcesError.message);
  }

  const preparedRows = prepareSourceImportRows({
    rows,
    existingSources: existingSources ?? [],
  });
  const results: CsvImportServerResultRow[] = [];

  for (const row of preparedRows) {
    if (!row.ok) {
      results.push({
        rowNumber: row.rowNumber,
        imported: false,
        message: row.message,
      });
      continue;
    }

    const { data, error } = await supabase
      .from("sources")
      .insert({
        ...row.payload,
        user_id: user.id,
      })
      .select("id")
      .single();

    if (error) {
      results.push({
        rowNumber: row.rowNumber,
        imported: false,
        message: error.message,
      });
      continue;
    }

    results.push({
      rowNumber: row.rowNumber,
      imported: true,
      message: "Imported.",
      sourceId: data.id,
    });
  }

  revalidateSourceViews();

  const summary = summarizeSourceImportResults(results);

  return successResult(
    summary.imported > 0
      ? `Imported ${summary.imported} source${summary.imported === 1 ? "" : "s"}${summary.skipped > 0 ? ` and skipped ${summary.skipped}.` : "."}`
      : "No sources were imported.",
    {
      results,
      imported: summary.imported,
      skipped: summary.skipped,
    },
  );
}

export async function attachSourceFileAction(
  sourceId: string,
  filePath: string,
  fileName: string,
  fileType?: string,
  fileSizeBytes?: number,
): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: existingSource, error: existingSourceError } = await supabase
    .from("sources")
    .select("file_path")
    .eq("id", sourceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingSourceError) {
    return errorResult(existingSourceError.message);
  }

  const { error } = await supabase
    .from("sources")
    .update({
      file_path: filePath,
      file_name: fileName,
      file_type: fileType || null,
      file_size_bytes:
        typeof fileSizeBytes === "number" && Number.isFinite(fileSizeBytes)
          ? fileSizeBytes
          : null,
      file_uploaded_at: new Date().toISOString(),
    })
    .eq("id", sourceId)
    .eq("user_id", user.id);

  if (error) {
    return errorResult(error.message);
  }

  if (existingSource?.file_path && existingSource.file_path !== filePath) {
    await supabase.storage.from("source-files").remove([existingSource.file_path]);
  }

  revalidateSourceViews(sourceId);

  return successResult("Attachment saved.");
}
