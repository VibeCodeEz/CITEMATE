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
import { captureMonitoredError } from "@/lib/monitoring/sentry";
import { ensureProfileForUser } from "@/lib/auth";
import { getSiteUrl } from "@/lib/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  deleteAccountSchema,
  passwordResetRequestSchema,
  passwordUpdateSchema,
  type DeleteAccountFormInput,
  signInSchema,
  signUpSchema,
  type PasswordResetRequestInput,
  type PasswordUpdateInput,
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
    captureMonitoredError(error, {
      area: "auth",
      action: "sign_in_failed",
      statusCode: error.status,
      extra: {
        code: error.code ?? null,
      },
    });
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
    captureMonitoredError(error, {
      area: "auth",
      action: "sign_up_failed",
      statusCode: error.status,
      extra: {
        code: error.code ?? null,
      },
    });
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
    captureMonitoredError(error, {
      area: "auth",
      action: "sign_out_failed",
      statusCode: error.status,
      extra: {
        code: error.code ?? null,
      },
    });
    return errorResult(getFriendlyAuthError(error));
  }

  revalidatePath("/", "layout");

  return successResult("Signed out successfully.");
}

export async function requestPasswordResetAction(
  values: PasswordResetRequestInput,
): Promise<ActionResult> {
  const parsed = passwordResetRequestSchema.safeParse(values);

  if (!parsed.success) {
    return errorResult(
      "Please correct the highlighted fields.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const supabase = await createSupabaseServerClient();
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? getSiteUrl();
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent("/auth/reset-password")}`;

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo,
  });

  if (error) {
    captureMonitoredError(error, {
      area: "auth",
      action: "password_reset_request_failed",
      statusCode: error.status,
      extra: {
        code: error.code ?? null,
      },
    });
    return errorResult(getFriendlyAuthError(error));
  }

  return successResult(
    "If that email exists, a password reset link has been sent.",
  );
}

export async function updatePasswordAction(
  values: PasswordUpdateInput,
): Promise<ActionResult<AuthSuccessData>> {
  const parsed = passwordUpdateSchema.safeParse(values);

  if (!parsed.success) {
    return errorResult(
      "Please correct the highlighted fields.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    captureMonitoredError(error, {
      area: "auth",
      action: "password_update_failed",
      statusCode: error.status,
      extra: {
        code: error.code ?? null,
      },
    });
    return errorResult(getFriendlyAuthError(error));
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");

  return successResult("Password updated. Sign in with your new password.", {
    redirectTo: "/auth/sign-in?notice=Password%20updated.%20Sign%20in%20with%20your%20new%20password.",
  });
}

export async function deleteAccountAction(
  values: DeleteAccountFormInput,
): Promise<ActionResult<AuthSuccessData>> {
  const parsed = deleteAccountSchema.safeParse(values);

  if (!parsed.success) {
    return errorResult(
      "Please confirm the deletion phrase before continuing.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return errorResult("Your session has expired. Sign in again and retry.");
  }

  const sourceFilesResult = await supabase
    .from("sources")
    .select("file_path")
    .eq("user_id", user.id)
    .not("file_path", "is", null);

  if (sourceFilesResult.error) {
    captureMonitoredError(sourceFilesResult.error, {
      area: "auth",
      action: "delete_account_load_files_failed",
      userId: user.id,
      statusCode: 500,
    });
    return errorResult(
      "We could not prepare account deletion right now. Please try again.",
    );
  }

  const filePaths = (sourceFilesResult.data ?? [])
    .map((item) => item.file_path)
    .filter((value): value is string => Boolean(value));

  if (filePaths.length > 0) {
    const { error: storageDeleteError } = await supabase.storage
      .from("source-files")
      .remove(filePaths);

    if (storageDeleteError) {
      captureMonitoredError(storageDeleteError, {
        area: "auth",
        action: "delete_account_storage_cleanup_failed",
        userId: user.id,
        statusCode: 500,
      });
      return errorResult(
        `We could not delete uploaded source files right now. ${storageDeleteError.message}`,
      );
    }
  }

  const { error } = await supabase.rpc("delete_current_user");

  if (error) {
    captureMonitoredError(error, {
      area: "auth",
      action: "delete_account_failed",
      userId: user.id,
      statusCode: 500,
    });

    const errorDetails = [error.message, error.details, error.hint]
      .filter(Boolean)
      .join(" ");

    return errorResult(
      errorDetails
        ? `We could not delete the account right now. ${errorDetails}`
        : "We could not delete the account right now. Apply the latest Supabase migration and try again.",
    );
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");

  return successResult("Your account and workspace data were deleted.", {
    redirectTo: "/",
  });
}
