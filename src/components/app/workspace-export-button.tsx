"use client";

import { useTransition } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function WorkspaceExportButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            const response = await fetch("/api/workspace-export", {
              method: "GET",
              cache: "no-store",
            });

            if (!response.ok) {
              throw new Error("Workspace export failed.");
            }

            const blob = await response.blob();
            const contentDisposition = response.headers.get("Content-Disposition");
            const fallbackName = "citemate-workspace-backup.json";
            const fileName =
              contentDisposition?.match(/filename="([^"]+)"/)?.[1] ?? fallbackName;
            const objectUrl = window.URL.createObjectURL(blob);
            const link = window.document.createElement("a");

            link.href = objectUrl;
            link.download = fileName;
            window.document.body.append(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(objectUrl);
            toast.success("Workspace backup downloaded.");
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Workspace export failed.",
            );
          }
        });
      }}
    >
      <Download className="size-4" />
      {pending ? "Preparing backup..." : "Download workspace backup"}
    </Button>
  );
}
