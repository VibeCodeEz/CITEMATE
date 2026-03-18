import { NextResponse } from "next/server";

import { getWorkspaceExportData } from "@/lib/data/citemate";

export const runtime = "nodejs";

function buildFileName() {
  const date = new Date().toISOString().slice(0, 10);
  return `citemate-workspace-backup-${date}.json`;
}

export async function GET() {
  const payload = await getWorkspaceExportData();

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${buildFileName()}"`,
      "Cache-Control": "no-store",
    },
  });
}
