"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ExternalLink, FileText, LoaderCircle, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatFileSize, isPdfAttachment } from "@/lib/source-files/utils";

type SourceAttachmentPanelProps = {
  sourceId: string;
  fileName: string;
  fileType: string | null;
  fileSizeBytes: number | null;
  fileUploadedAt: string | null;
};

type PreviewPayload = {
  signedUrl: string;
  fileName: string | null;
  fileType: string | null;
  fileSizeBytes: number | null;
  fileUploadedAt: string | null;
};

function formatUploadDate(value: string | null) {
  if (!value) {
    return "Unknown upload date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function SourceAttachmentPanel({
  sourceId,
  fileName,
  fileType,
  fileSizeBytes,
  fileUploadedAt,
}: SourceAttachmentPanelProps) {
  const [previewPayload, setPreviewPayload] = useState<PreviewPayload | null>(null);
  const [previewFetchState, setPreviewFetchState] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const supportsPdfPreview = isPdfAttachment({ fileName, fileType });

  useEffect(() => {
    let cancelled = false;

    async function loadPreview() {
      if (!supportsPdfPreview) {
        return;
      }

      setPreviewFetchState("loading");
      setIframeLoaded(false);

      try {
        const response = await fetch(`/api/source-files/${sourceId}?mode=json`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Preview request failed.");
        }

        const payload = (await response.json()) as PreviewPayload;

        if (cancelled) {
          return;
        }

        setPreviewPayload(payload);
        setPreviewFetchState("ready");
      } catch {
        if (cancelled) {
          return;
        }

        setPreviewFetchState("error");
      }
    }

    void loadPreview();

    return () => {
      cancelled = true;
    };
  }, [sourceId, supportsPdfPreview]);

  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="font-serif text-3xl tracking-tight">
              Attachment
            </CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Preview attached PDFs in place and open the original file when needed.
            </p>
          </div>
          <Badge variant="secondary" className="rounded-full">
            {supportsPdfPreview ? "PDF preview available" : "Preview unavailable"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[1.5rem] border border-border/80 bg-secondary/30 p-4 sm:col-span-2 xl:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              File name
            </p>
            <p className="mt-2 break-all text-sm leading-6 text-foreground">{fileName}</p>
          </div>
          <div className="rounded-[1.5rem] border border-border/80 bg-secondary/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              File size
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              {formatFileSize(fileSizeBytes)}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-border/80 bg-secondary/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              File type
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              {fileType || "Unknown type"}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-border/80 bg-secondary/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Uploaded
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              {formatUploadDate(fileUploadedAt)}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-border/80 bg-secondary/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Preview state
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              {!supportsPdfPreview
                ? "Unsupported file type"
                : previewFetchState === "loading"
                  ? "Loading preview..."
                  : previewFetchState === "error"
                    ? "Preview unavailable"
                    : iframeLoaded
                      ? "Preview ready"
                      : "Preparing preview..."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href={`/api/source-files/${sourceId}`}>
              <FileText className="size-4" />
              Download file
            </Link>
          </Button>
          {previewPayload?.signedUrl ? (
            <Button variant="outline" asChild>
              <Link href={previewPayload.signedUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                Open in new tab
              </Link>
            </Button>
          ) : null}
        </div>

        {!supportsPdfPreview ? (
          <div className="rounded-[1.5rem] border border-dashed border-border/80 bg-secondary/20 p-5">
            <div className="flex items-start gap-3">
              <TriangleAlert className="mt-0.5 size-5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="font-medium">This attachment can’t be previewed inline.</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  PDF previews are supported now. Other attachment types can still be downloaded securely.
                </p>
              </div>
            </div>
          </div>
        ) : previewFetchState === "error" ? (
          <div className="rounded-[1.5rem] border border-dashed border-destructive/30 bg-destructive/5 p-5">
            <div className="flex items-start gap-3">
              <TriangleAlert className="mt-0.5 size-5 text-destructive" />
              <div className="space-y-1">
                <p className="font-medium text-foreground">Preview failed to load.</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  The file is still protected and downloadable, but the preview request did not complete.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative min-h-[32rem] overflow-hidden rounded-[1.75rem] border border-border/80 bg-secondary/15">
            {!iframeLoaded ? (
              <div className="absolute inset-0 flex items-center justify-center gap-3 bg-background/85">
                <LoaderCircle className="size-5 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  {previewFetchState === "loading" ? "Fetching preview..." : "Loading PDF preview..."}
                </p>
              </div>
            ) : null}
            {previewPayload?.signedUrl ? (
              <iframe
                title={`${fileName} preview`}
                src={previewPayload.signedUrl}
                className="h-[70vh] w-full bg-white"
                onLoad={() => setIframeLoaded(true)}
                onError={() => setPreviewFetchState("error")}
              />
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
