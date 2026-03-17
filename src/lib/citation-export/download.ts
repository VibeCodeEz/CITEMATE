"use client";

import type { CitationExportDocument } from "@/lib/citation-export/types";

export function downloadCitationExport(document: CitationExportDocument) {
  const blob = new Blob([document.content], { type: document.mimeType });
  const objectUrl = URL.createObjectURL(blob);
  const link = window.document.createElement("a");

  link.href = objectUrl;
  link.download = document.fileName;
  window.document.body.append(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
}
