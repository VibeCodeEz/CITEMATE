import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    sourceId: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { sourceId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth/sign-in", _request.url));
  }

  const { data: source, error } = await supabase
    .from("sources")
    .select("file_name, file_path")
    .eq("id", sourceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !source?.file_path) {
    return NextResponse.json({ error: "Attachment not found." }, { status: 404 });
  }

  const { data: signedUrl, error: signedUrlError } = await supabase.storage
    .from("source-files")
    .createSignedUrl(source.file_path, 60);

  if (signedUrlError || !signedUrl?.signedUrl) {
    return NextResponse.json(
      { error: signedUrlError?.message ?? "Unable to create signed URL." },
      { status: 500 },
    );
  }

  return NextResponse.redirect(signedUrl.signedUrl);
}
