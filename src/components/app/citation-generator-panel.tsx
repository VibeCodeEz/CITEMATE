"use client";

import { useState } from "react";

import { CopyButton } from "@/components/app/copy-button";
import { SourceExportActions } from "@/components/app/source-export-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { citationStyles, formatCitation, getStyleLabel } from "@/lib/citations";
import type { CitationStyle, SourceWithRelations } from "@/types/app";

type CitationGeneratorPanelProps = {
  source: SourceWithRelations;
};

export function CitationGeneratorPanel({
  source,
}: CitationGeneratorPanelProps) {
  const [style, setStyle] = useState<CitationStyle>(source.citation_style);
  const citation = formatCitation(source, style);

  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="font-serif text-3xl tracking-tight">
              Citation generator
            </CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Switch styles instantly and copy the formatted result.
            </p>
          </div>
          <Badge variant="secondary" className="rounded-full">
            Preferred: {getStyleLabel(source.citation_style)}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {citationStyles.map((citationStyle) => (
            <Button
              key={citationStyle.key}
              type="button"
              variant={style === citationStyle.key ? "default" : "outline"}
              size="sm"
              onClick={() => setStyle(citationStyle.key)}
            >
              {citationStyle.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-3xl border border-border/80 bg-background/70 p-5">
          <p className="text-sm leading-7">{citation}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CopyButton text={citation} />
          <SourceExportActions sources={[source]} />
        </div>
      </CardContent>
    </Card>
  );
}
