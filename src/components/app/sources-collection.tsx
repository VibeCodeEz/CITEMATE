"use client";

import { useState } from "react";

import { SourceCard } from "@/components/app/source-card";
import { MultiSourceCompareDialog } from "@/components/app/multi-source-compare-dialog";
import { SourceExportActions } from "@/components/app/source-export-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { SourceWithRelations, SubjectWithCount } from "@/types/app";

type SourcesCollectionProps = {
  sources: SourceWithRelations[];
  subjects: SubjectWithCount[];
};

export function SourcesCollection({
  sources,
  subjects,
}: SourcesCollectionProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedSources = sources.filter((source) => selectedIds.includes(source.id));
  const allSelected = sources.length > 0 && selectedIds.length === sources.length;

  function toggleSource(sourceId: string, checked: boolean) {
    setSelectedIds((current) =>
      checked
        ? Array.from(new Set([...current, sourceId]))
        : current.filter((id) => id !== sourceId),
    );
  }

  function handleToggleAll() {
    setSelectedIds(allSelected ? [] : sources.map((source) => source.id));
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/70 bg-card/90">
        <CardContent className="flex flex-col gap-4 py-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium">Bulk export</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full">
                {selectedSources.length} selected
              </Badge>
              <p className="text-sm text-muted-foreground">
                Select sources on this page, then download BibTeX or RIS.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleToggleAll}>
              {allSelected ? "Clear page selection" : "Select all on page"}
            </Button>
            <MultiSourceCompareDialog
              sources={selectedSources}
              disabled={selectedSources.length < 2}
            />
            <SourceExportActions
              sources={selectedSources}
              disabled={selectedSources.length === 0}
              labelPrefix="Export"
            />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-5">
        {sources.map((source) => (
          <SourceCard
            key={source.id}
            source={source}
            subjects={subjects}
            allSources={sources}
            selectionControl={
              <Checkbox
                checked={selectedIds.includes(source.id)}
                onCheckedChange={(checked) => toggleSource(source.id, Boolean(checked))}
                aria-label={`Select ${source.title}`}
              />
            }
          />
        ))}
      </div>
    </div>
  );
}
