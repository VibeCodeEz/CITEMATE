"use server";

import { revalidatePath } from "next/cache";

import {
  errorResult,
  successResult,
  type ActionResult,
} from "@/lib/action-result";
import { requireUser } from "@/lib/auth";
import { captureMonitoredError } from "@/lib/monitoring/sentry";
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
import type { SourceVersionSnapshot } from "@/types/app";

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

function buildSourceVersionSnapshot(args: {
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
  subjectIds: string[];
}): SourceVersionSnapshot {
  return {
    title: args.title,
    authors: args.authors,
    year: args.year,
    publisher: args.publisher,
    url: args.url,
    doi: args.doi,
    tags: args.tags,
    abstract: args.abstract,
    source_type: args.source_type,
    citation_style: args.citation_style,
    subject_ids: args.subjectIds,
  };
}

async function saveSourceVersion(args: {
  userId: string;
  sourceId: string;
  snapshot: SourceVersionSnapshot;
  reason: string;
}) {
  const supabase = await createSupabaseServerClient();

  await supabase.from("source_versions").insert({
    user_id: args.userId,
    source_id: args.sourceId,
    snapshot: args.snapshot,
    reason: args.reason,
  });
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
    const [{ data: existingSource, error: existingSourceError }, { data: existingLinks, error: existingLinksError }] =
      await Promise.all([
        supabase
          .from("sources")
          .select("title,authors,year,publisher,url,doi,tags,abstract,source_type,citation_style")
          .eq("id", sourceId)
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("source_subjects")
          .select("subject_id")
          .eq("source_id", sourceId)
          .eq("user_id", user.id),
      ]);

    if (existingSourceError) {
      return errorResult(existingSourceError.message);
    }

    if (existingLinksError) {
      return errorResult(existingLinksError.message);
    }

    if (!existingSource) {
      return errorResult("We couldn't find that source.");
    }

    await saveSourceVersion({
      userId: user.id,
      sourceId,
      snapshot: buildSourceVersionSnapshot({
        title: existingSource.title,
        authors: existingSource.authors,
        year: existingSource.year,
        publisher: existingSource.publisher,
        url: existingSource.url,
        doi: existingSource.doi,
        tags: existingSource.tags,
        abstract: existingSource.abstract,
        source_type: existingSource.source_type,
        citation_style: existingSource.citation_style,
        subjectIds: (existingLinks ?? []).map((link) => link.subject_id),
      }),
      reason: "before_update",
    });

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

    await saveSourceVersion({
      userId: user.id,
      sourceId,
      snapshot: buildSourceVersionSnapshot({
        title: payload.title,
        authors: payload.authors,
        year: payload.year,
        publisher: payload.publisher,
        url: payload.url,
        doi: payload.doi,
        tags: payload.tags,
        abstract: payload.abstract,
        source_type: payload.source_type,
        citation_style: payload.citation_style,
        subjectIds: parsed.data.subjectIds ?? [],
      }),
      reason: "created",
    });
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
    captureMonitoredError(sourceError, {
      area: "upload",
      action: "delete_source_lookup_failed",
      userId: user.id,
      statusCode: 500,
    });
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
    captureMonitoredError(error, {
      area: "upload",
      action: "delete_source_failed",
      userId: user.id,
      statusCode: 500,
    });
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
    captureMonitoredError(existingSourceError, {
      area: "upload",
      action: "attach_source_lookup_failed",
      userId: user.id,
      statusCode: 500,
    });
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
    captureMonitoredError(error, {
      area: "upload",
      action: "attach_source_metadata_failed",
      userId: user.id,
      statusCode: 500,
    });
    return errorResult(error.message);
  }

  if (existingSource?.file_path && existingSource.file_path !== filePath) {
    await supabase.storage.from("source-files").remove([existingSource.file_path]);
  }

  revalidateSourceViews(sourceId);

  return successResult("Attachment saved.");
}

export async function restoreSourceVersionAction(
  sourceId: string,
  versionId: string,
): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const [
    { data: version, error: versionError },
    { data: source, error: sourceError },
    { data: existingLinks, error: linksError },
  ] = await Promise.all([
    supabase
      .from("source_versions")
      .select("snapshot")
      .eq("id", versionId)
      .eq("source_id", sourceId)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("sources")
      .select("title,authors,year,publisher,url,doi,tags,abstract,source_type,citation_style")
      .eq("id", sourceId)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("source_subjects")
      .select("subject_id")
      .eq("source_id", sourceId)
      .eq("user_id", user.id),
  ]);

  if (versionError) {
    return errorResult(versionError.message);
  }

  if (sourceError) {
    return errorResult(sourceError.message);
  }

  if (linksError) {
    return errorResult(linksError.message);
  }

  if (!version || !source) {
    return errorResult("We couldn't find that saved source version.");
  }

  await saveSourceVersion({
    userId: user.id,
    sourceId,
    snapshot: buildSourceVersionSnapshot({
      title: source.title,
      authors: source.authors,
      year: source.year,
      publisher: source.publisher,
      url: source.url,
      doi: source.doi,
      tags: source.tags,
      abstract: source.abstract,
      source_type: source.source_type,
      citation_style: source.citation_style,
      subjectIds: (existingLinks ?? []).map((link) => link.subject_id),
    }),
    reason: "before_restore",
  });

  const snapshot = version.snapshot as unknown as SourceVersionSnapshot;

  const { error: updateError } = await supabase
    .from("sources")
    .update({
      title: snapshot.title,
      authors: snapshot.authors,
      year: snapshot.year,
      publisher: snapshot.publisher,
      url: snapshot.url,
      doi: snapshot.doi,
      tags: snapshot.tags,
      abstract: snapshot.abstract,
      source_type: snapshot.source_type,
      citation_style: snapshot.citation_style,
    })
    .eq("id", sourceId)
    .eq("user_id", user.id);

  if (updateError) {
    return errorResult(updateError.message);
  }

  const { error: deleteLinksError } = await supabase
    .from("source_subjects")
    .delete()
    .eq("source_id", sourceId)
    .eq("user_id", user.id);

  if (deleteLinksError) {
    return errorResult(deleteLinksError.message);
  }

  if (snapshot.subject_ids.length > 0) {
    const { error: insertLinksError } = await supabase.from("source_subjects").insert(
      snapshot.subject_ids.map((subjectId) => ({
        source_id: sourceId,
        subject_id: subjectId,
        user_id: user.id,
      })),
    );

    if (insertLinksError) {
      return errorResult(insertLinksError.message);
    }
  }

  revalidateSourceViews(sourceId);

  return successResult("Source restored to that saved version.");
}
