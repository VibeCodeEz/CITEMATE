import { type NextRequest, NextResponse } from "next/server";

import { normalizeNextPath } from "@/lib/auth-redirect";
import { getFriendlyAuthError } from "@/lib/auth-errors";
import { ensureProfileForUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = normalizeNextPath(searchParams.get("next"));
  const signInUrl = new URL("/auth/sign-in", origin);

  if (!code) {
    signInUrl.searchParams.set(
      "error",
      "We could not verify that sign-in link. Please try again.",
    );
    return NextResponse.redirect(signInUrl);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    signInUrl.searchParams.set("error", getFriendlyAuthError(error));
    return NextResponse.redirect(signInUrl);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await ensureProfileForUser(user);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
