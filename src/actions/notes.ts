"use server";

import { revalidatePath } from "next/cache";

import {
  errorResult,
  successResult,
  type ActionResult,
} from "@/lib/action-result";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { noteSchema, type NoteInput } from "@/lib/validations/note";

function revalidateNoteViews(sourceIds: string[] = []) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notes");
  revalidatePath("/dashboard/sources");

  sourceIds.forEach((sourceId) => {
    revalidatePath(`/dashboard/sources/${sourceId}`);
  });
}

export async function upsertNoteAction(values: NoteInput): Promise<ActionResult> {
  const parsed = noteSchema.safeParse(values);

  if (!parsed.success) {
    return errorResult(
      "Please correct the note fields.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  let previousSourceId: string | null = null;

  if (parsed.data.id) {
    const { data: existingNote, error: existingNoteError } = await supabase
      .from("notes")
      .select("source_id")
      .eq("id", parsed.data.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingNoteError) {
      return errorResult(existingNoteError.message);
    }

    if (!existingNote) {
      return errorResult("We couldn't find that note.");
    }

    previousSourceId = existingNote.source_id;
  }

  if (parsed.data.sourceId) {
    const { data: source, error: sourceError } = await supabase
      .from("sources")
      .select("id")
      .eq("id", parsed.data.sourceId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (sourceError) {
      return errorResult(sourceError.message);
    }

    if (!source) {
      return errorResult("Choose one of your saved sources.");
    }
  }

  const payload = {
    user_id: user.id,
    title: parsed.data.title,
    content: parsed.data.content,
    source_id: parsed.data.sourceId ?? null,
  };

  if (parsed.data.id) {
    const { error } = await supabase
      .from("notes")
      .update(payload)
      .eq("id", parsed.data.id)
      .eq("user_id", user.id);

    if (error) {
      return errorResult(error.message);
    }

    revalidateNoteViews(
      [previousSourceId, parsed.data.sourceId].filter(
        (value): value is string => Boolean(value),
      ),
    );

    return successResult("Note updated.");
  }

  const { error } = await supabase.from("notes").insert(payload);

  if (error) {
    return errorResult(error.message);
  }

  revalidateNoteViews(parsed.data.sourceId ? [parsed.data.sourceId] : []);

  return successResult("Note saved.");
}

export async function deleteNoteAction(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: note, error: noteError } = await supabase
    .from("notes")
    .select("source_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (noteError) {
    return errorResult(noteError.message);
  }

  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return errorResult(error.message);
  }

  revalidateNoteViews(note?.source_id ? [note.source_id] : []);

  return successResult("Note deleted.");
}
