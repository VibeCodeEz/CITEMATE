"use server";

import { revalidatePath } from "next/cache";

import { errorResult, successResult, type ActionResult } from "@/lib/action-result";
import { requireUser } from "@/lib/auth";
import type { SourceReminderKey } from "@/lib/reminders/source-reminders";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function revalidateReminderViews(sourceId: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/needs-attention");
  revalidatePath(`/dashboard/sources/${sourceId}`);
}

export async function dismissSourceReminderAction(
  sourceId: string,
  reminderKey: SourceReminderKey,
  sourceUpdatedAt: string,
): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: source, error: sourceError } = await supabase
    .from("sources")
    .select("id,updated_at")
    .eq("id", sourceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (sourceError) {
    return errorResult(sourceError.message);
  }

  if (!source) {
    return errorResult("That source could not be found.");
  }

  if (source.updated_at !== sourceUpdatedAt) {
    return errorResult("This reminder changed. Refresh and try again.");
  }

  const { error } = await supabase.from("source_reminder_dismissals").upsert({
    user_id: user.id,
    source_id: sourceId,
    reminder_key: reminderKey,
    source_updated_at: sourceUpdatedAt,
  });

  if (error) {
    return errorResult(error.message);
  }

  revalidateReminderViews(sourceId);

  return successResult("Reminder dismissed for now.");
}
