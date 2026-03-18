"use client";

import { useTransition } from "react";
import { History, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { restoreNoteVersionAction } from "@/actions/notes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { NoteVersion } from "@/types/app";

type NoteVersionHistoryPanelProps = {
  noteId: string;
  versions: NoteVersion[];
};

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function NoteVersionHistoryPanel({
  noteId,
  versions,
}: NoteVersionHistoryPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (versions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-[1.5rem] border border-border/80 bg-background/70 p-4">
      <div className="flex items-center gap-2">
        <History className="size-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Version history
        </h3>
      </div>
      <div className="space-y-2">
        {versions.map((version) => (
          <div
            key={version.id}
            className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border/70 bg-secondary/20 p-3"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-full">
                  {version.reason.replace(/_/g, " ")}
                </Badge>
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  {formatTimestamp(version.created_at)}
                </p>
              </div>
              <p className="text-sm font-medium">{version.snapshot.title}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => {
                const confirmed = window.confirm(
                  "Restore this saved note version? Your current note will be saved as another version first.",
                );

                if (!confirmed) {
                  return;
                }

                startTransition(async () => {
                  const result = await restoreNoteVersionAction(noteId, version.id);

                  if (!result.success) {
                    toast.error(result.message);
                    return;
                  }

                  toast.success(result.message);
                  router.refresh();
                });
              }}
            >
              <RotateCcw className="size-4" />
              Restore
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
