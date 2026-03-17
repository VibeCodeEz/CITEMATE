export function formatFileSize(bytes: number | null | undefined) {
  if (!bytes || bytes < 0) {
    return "Unknown size";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export function isPdfAttachment(input: {
  fileName?: string | null;
  fileType?: string | null;
}) {
  const fileType = input.fileType?.trim().toLowerCase() ?? "";
  const fileName = input.fileName?.trim().toLowerCase() ?? "";

  return fileType === "application/pdf" || fileName.endsWith(".pdf");
}
