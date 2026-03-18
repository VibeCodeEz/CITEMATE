"use client";

import { BookCopy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { SourceWithRelations } from "@/types/app";

type MultiSourceCompareDialogProps = {
  sources: SourceWithRelations[];
  disabled?: boolean;
};

function renderValue(value: string | null | undefined) {
  return value?.trim() ? value : "Not added";
}

export function MultiSourceCompareDialog({
  sources,
  disabled = false,
}: MultiSourceCompareDialogProps) {
  return (
    <Dialog>
      <DialogTrigger
        render={<Button type="button" variant="outline" size="sm" />}
        disabled={disabled || sources.length < 2}
      >
        <BookCopy className="size-4" />
        Compare selected
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Multi-source compare view</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 xl:grid-cols-3">
          {sources.map((source) => (
            <div
              key={source.id}
              className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4"
            >
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-full">
                      {source.source_type.replace(/_/g, " ")}
                    </Badge>
                    <Badge variant="secondary" className="rounded-full">
                      {source.year ?? "n.d."}
                    </Badge>
                  </div>
                  <h3 className="font-serif text-2xl tracking-tight">{source.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {source.authors.join(", ") || "Unknown author"}
                  </p>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Publisher
                    </p>
                    <p className="mt-1 leading-6 text-muted-foreground">
                      {renderValue(source.publisher)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      DOI
                    </p>
                    <p className="mt-1 break-all leading-6 text-muted-foreground">
                      {renderValue(source.doi)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      URL
                    </p>
                    <p className="mt-1 break-all leading-6 text-muted-foreground">
                      {renderValue(source.url)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Abstract
                    </p>
                    <p className="mt-1 leading-6 text-muted-foreground">
                      {renderValue(source.abstract)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Subjects
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {source.subjects.length > 0 ? (
                        source.subjects.map((subject) => (
                          <Badge key={subject.id} variant="secondary" className="rounded-full">
                            {subject.name}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground">None</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Tags
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {source.tags.length > 0 ? (
                        source.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="rounded-full">
                            #{tag}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground">None</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Linked notes
                    </p>
                    <p className="mt-1 leading-6 text-muted-foreground">
                      {source.notes.length} note{source.notes.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
