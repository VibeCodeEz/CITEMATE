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
  sourceSchema,
  type SourceInput,
} from "@/lib/validations/source";

type SourceActionData = {
  sourceId?: string;
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
    doi: parsed.data.doi || null,
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

export async function attachSourceFileAction(
  sourceId: string,
  filePath: string,
  fileName: string,
): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("sources")
    .update({
      file_path: filePath,
      file_name: fileName,
    })
    .eq("id", sourceId)
    .eq("user_id", user.id);

  if (error) {
    return errorResult(error.message);
  }

  revalidateSourceViews(sourceId);

  return successResult("Attachment saved.");
}
