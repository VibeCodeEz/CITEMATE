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
import type { NoteVersionSnapshot } from "@/types/app";

function revalidateNoteViews(sourceIds: string[] = []) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notes");
  revalidatePath("/dashboard/sources");

  sourceIds.forEach((sourceId) => {
    revalidatePath(`/dashboard/sources/${sourceId}`);
  });
}

function buildNoteVersionSnapshot(args: {
  title: string;
  content: string;
  sourceId: string | null;
}): NoteVersionSnapshot {
  return {
    title: args.title,
    content: args.content,
    source_id: args.sourceId,
  };
}

async function saveNoteVersion(args: {
  userId: string;
  noteId: string;
  snapshot: NoteVersionSnapshot;
  reason: string;
}) {
  const supabase = await createSupabaseServerClient();

  await supabase.from("note_versions").insert({
    user_id: args.userId,
    note_id: args.noteId,
    snapshot: args.snapshot,
    reason: args.reason,
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
      .select("title,content,source_id")
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

    await saveNoteVersion({
      userId: user.id,
      noteId: parsed.data.id,
      snapshot: buildNoteVersionSnapshot({
        title: existingNote.title,
        content: existingNote.content,
        sourceId: existingNote.source_id,
      }),
      reason: "before_update",
    });
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

  const { data: createdNote, error } = await supabase
    .from("notes")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    return errorResult(error.message);
  }

  await saveNoteVersion({
    userId: user.id,
    noteId: createdNote.id,
    snapshot: buildNoteVersionSnapshot({
      title: payload.title,
      content: payload.content,
      sourceId: payload.source_id,
    }),
    reason: "created",
  });

  revalidateNoteViews(parsed.data.sourceId ? [parsed.data.sourceId] : []);

  return successResult("Note saved.");
}

export async function restoreNoteVersionAction(
  noteId: string,
  versionId: string,
): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const [{ data: version, error: versionError }, { data: note, error: noteError }] =
    await Promise.all([
      supabase
        .from("note_versions")
        .select("snapshot")
        .eq("id", versionId)
        .eq("note_id", noteId)
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("notes")
        .select("title,content,source_id")
        .eq("id", noteId)
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

  if (versionError) {
    return errorResult(versionError.message);
  }

  if (noteError) {
    return errorResult(noteError.message);
  }

  if (!version || !note) {
    return errorResult("We couldn't find that saved note version.");
  }

  await saveNoteVersion({
    userId: user.id,
    noteId,
    snapshot: buildNoteVersionSnapshot({
      title: note.title,
      content: note.content,
      sourceId: note.source_id,
    }),
    reason: "before_restore",
  });

  const snapshot = version.snapshot as unknown as NoteVersionSnapshot;

  const { error } = await supabase
    .from("notes")
    .update({
      title: snapshot.title,
      content: snapshot.content,
      source_id: snapshot.source_id,
    })
    .eq("id", noteId)
    .eq("user_id", user.id);

  if (error) {
    return errorResult(error.message);
  }

  revalidateNoteViews(
    [note.source_id, snapshot.source_id].filter(
      (value): value is string => Boolean(value),
    ),
  );

  return successResult("Note restored to that saved version.");
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
