"use server";

import { revalidatePath } from "next/cache";

import {
  errorResult,
  successResult,
  type ActionResult,
} from "@/lib/action-result";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { subjectSchema, type SubjectInput } from "@/lib/validations/subject";

function revalidateSubjectViews() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/subjects");
  revalidatePath("/dashboard/sources");
}

export async function upsertSubjectAction(
  values: SubjectInput,
): Promise<ActionResult> {
  const parsed = subjectSchema.safeParse(values);

  if (!parsed.success) {
    return errorResult(
      "Please correct the subject fields.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const payload = {
    user_id: user.id,
    name: parsed.data.name,
    description: parsed.data.description || null,
    color: parsed.data.color || "#0f766e",
  };

  if (parsed.data.id) {
    const { error } = await supabase
      .from("subjects")
      .update(payload)
      .eq("id", parsed.data.id)
      .eq("user_id", user.id);

    if (error) {
      return errorResult(error.message);
    }

    revalidateSubjectViews();

    return successResult("Subject updated.");
  }

  const { error } = await supabase.from("subjects").insert(payload);

  if (error) {
    return errorResult(error.message);
  }

  revalidateSubjectViews();

  return successResult("Subject created.");
}

export async function deleteSubjectAction(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("subjects")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return errorResult(error.message);
  }

  revalidateSubjectViews();

  return successResult("Subject deleted.");
}
