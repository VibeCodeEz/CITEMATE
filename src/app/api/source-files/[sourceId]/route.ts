import { NextResponse, type NextRequest } from "next/server";

import { captureMonitoredError } from "@/lib/monitoring/sentry";
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
    .select("file_name, file_path, file_type, file_size_bytes, file_uploaded_at")
    .eq("id", sourceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !source?.file_path) {
    if (error) {
      captureMonitoredError(error, {
        area: "upload",
        action: "attachment_lookup_failed",
        userId: user.id,
        route: `/api/source-files/${sourceId}`,
        statusCode: 404,
      });
    }
    return NextResponse.json({ error: "Attachment not found." }, { status: 404 });
  }

  const { data: signedUrl, error: signedUrlError } = await supabase.storage
    .from("source-files")
    .createSignedUrl(source.file_path, 60);

  if (signedUrlError || !signedUrl?.signedUrl) {
    captureMonitoredError(signedUrlError ?? new Error("Missing signed URL"), {
      area: "upload",
      action: "signed_url_failed",
      userId: user.id,
      route: `/api/source-files/${sourceId}`,
      statusCode: 500,
    });
    return NextResponse.json(
      { error: signedUrlError?.message ?? "Unable to create signed URL." },
      { status: 500 },
    );
  }

  if (_request.nextUrl.searchParams.get("mode") === "json") {
    return NextResponse.json({
      signedUrl: signedUrl.signedUrl,
      fileName: source.file_name,
      fileType: source.file_type,
      fileSizeBytes: source.file_size_bytes,
      fileUploadedAt: source.file_uploaded_at,
    });
  }

  return NextResponse.redirect(signedUrl.signedUrl);
}
