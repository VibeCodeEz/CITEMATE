"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import {
  errorResult,
  successResult,
  type ActionResult,
} from "@/lib/action-result";
import { normalizeNextPath } from "@/lib/auth-redirect";
import { getFriendlyAuthError } from "@/lib/auth-errors";
import { ensureProfileForUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  signInSchema,
  signUpSchema,
  type SignInInput,
  type SignUpInput,
} from "@/lib/validations/auth";

type AuthSuccessData = {
  redirectTo?: string;
};

export async function signInAction(
  values: SignInInput,
  nextPath?: string,
): Promise<ActionResult<AuthSuccessData>> {
  const parsed = signInSchema.safeParse(values);

  if (!parsed.success) {
    return errorResult(
      "Please correct the highlighted fields.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return errorResult(getFriendlyAuthError(error));
  }

  if (user) {
    await ensureProfileForUser(user);
  }

  revalidatePath("/", "layout");

  return successResult("Welcome back.", {
    redirectTo: normalizeNextPath(nextPath),
  });
}

export async function signUpAction(
  values: SignUpInput,
  nextPath?: string,
): Promise<ActionResult<AuthSuccessData>> {
  const parsed = signUpSchema.safeParse(values);

  if (!parsed.success) {
    return errorResult(
      "Please correct the highlighted fields.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const supabase = await createSupabaseServerClient();
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const resolvedNextPath = normalizeNextPath(nextPath);
  const redirectUrl = origin
    ? `${origin}/auth/callback?next=${encodeURIComponent(resolvedNextPath)}`
    : undefined;

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
      emailRedirectTo: redirectUrl,
    },
  });

  if (error) {
    return errorResult(getFriendlyAuthError(error));
  }

  revalidatePath("/", "layout");

  if (data.user && data.session) {
    await ensureProfileForUser(data.user);

    return successResult("Account created successfully.", {
      redirectTo: resolvedNextPath,
    });
  }

  return successResult(
    "Account created. Check your inbox to verify your email before signing in.",
  );
}

export async function signOutAction(): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return errorResult(getFriendlyAuthError(error));
  }

  revalidatePath("/", "layout");

  return successResult("Signed out successfully.");
}
