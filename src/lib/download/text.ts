"use client";

export function downloadTextFile(args: {
  content: string;
  fileName: string;
  mimeType?: string;
}) {
  const blob = new Blob([args.content], {
    type: args.mimeType ?? "text/plain;charset=utf-8",
  });
  const objectUrl = URL.createObjectURL(blob);
  const link = window.document.createElement("a");

  link.href = objectUrl;
  link.download = args.fileName;
  window.document.body.append(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
}
