"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { buildCitationExportDocument, mapSourceToCitationExportSource } from "@/lib/citation-export";
import { downloadCitationExport } from "@/lib/citation-export/download";
import type { SourceWithRelations } from "@/types/app";

type SourceExportActionsProps = {
  sources: SourceWithRelations[];
  disabled?: boolean;
  size?: "default" | "sm";
  labelPrefix?: string;
};

export function SourceExportActions({
  sources,
  disabled = false,
  size = "sm",
  labelPrefix,
}: SourceExportActionsProps) {
  function handleExport(format: "bibtex" | "ris") {
    if (sources.length === 0) {
      toast.error("Select at least one source to export.");
      return;
    }

    const document = buildCitationExportDocument(
      sources.map((source) => mapSourceToCitationExportSource(source)),
      format,
    );

    downloadCitationExport(document);
    toast.success(
      `Downloaded ${format === "bibtex" ? "BibTeX" : "RIS"} for ${sources.length} source${sources.length === 1 ? "" : "s"}.`,
    );
  }

  const bibLabel = labelPrefix ? `${labelPrefix} BibTeX` : "BibTeX";
  const risLabel = labelPrefix ? `${labelPrefix} RIS` : "RIS";

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size={size}
        disabled={disabled || sources.length === 0}
        onClick={() => handleExport("bibtex")}
      >
        <Download className="size-4" />
        {bibLabel}
      </Button>
      <Button
        type="button"
        variant="outline"
        size={size}
        disabled={disabled || sources.length === 0}
        onClick={() => handleExport("ris")}
      >
        <Download className="size-4" />
        {risLabel}
      </Button>
    </div>
  );
}
