"use server";

import { revalidatePath } from "next/cache";

import {
  errorResult,
  successResult,
  type ActionResult,
} from "@/lib/action-result";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updateChecklistProgressAction(
  checklistItemId: string,
  completed: boolean,
): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: item, error: itemError } = await supabase
    .from("checklist_items")
    .select("id")
    .eq("id", checklistItemId)
    .maybeSingle();

  if (itemError) {
    return errorResult(itemError.message);
  }

  if (!item) {
    return errorResult("That checklist item could not be found.");
  }

  const { error } = await supabase.from("checklist_progress").upsert({
    user_id: user.id,
    checklist_item_id: checklistItemId,
    completed,
  });

  if (error) {
    return errorResult(error.message);
  }

  revalidatePath("/dashboard/checklist");
  revalidatePath("/dashboard");

  return successResult("Checklist saved.");
}
