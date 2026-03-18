"use client";

import { useTransition } from "react";
import { History, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { restoreSourceVersionAction } from "@/actions/sources";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SourceVersion } from "@/types/app";

type SourceVersionHistoryCardProps = {
  sourceId: string;
  versions: SourceVersion[];
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

export function SourceVersionHistoryCard({
  sourceId,
  versions,
}: SourceVersionHistoryCardProps) {
  const router = useRouter();
  const [pendingId, startTransition] = useTransition();

  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif text-3xl tracking-tight">
          <History className="size-5 text-primary" />
          Citation history
        </CardTitle>
      </CardHeader>
      <CardContent>
        {versions.length === 0 ? (
          <p className="text-sm leading-6 text-muted-foreground">
            Saved versions will appear here after edits.
          </p>
        ) : (
          <div className="space-y-3">
            {versions.map((version) => (
              <div
                key={version.id}
                className="rounded-[1.5rem] border border-border/80 bg-secondary/25 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="rounded-full">
                        {version.reason.replace(/_/g, " ")}
                      </Badge>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {formatTimestamp(version.created_at)}
                      </p>
                    </div>
                    <p className="font-medium">{version.snapshot.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {version.snapshot.authors.join(", ") || "Unknown author"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pendingId}
                    onClick={() => {
                      const confirmed = window.confirm(
                        "Restore this saved source version? Your current metadata will be saved as another version first.",
                      );

                      if (!confirmed) {
                        return;
                      }

                      startTransition(async () => {
                        const result = await restoreSourceVersionAction(
                          sourceId,
                          version.id,
                        );

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
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
