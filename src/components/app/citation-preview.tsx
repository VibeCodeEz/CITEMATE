"use client";

import { CopyButton } from "@/components/app/copy-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  citationStyles,
  generateCitationPreviewSet,
  getStyleLabel,
} from "@/lib/citations";
import type { CitationSource } from "@/lib/citations/types";
import type { CitationStyle } from "@/types/app";

type CitationPreviewProps = {
  source: CitationSource;
  activeStyle?: CitationStyle;
  compact?: boolean;
};

export function CitationPreview({
  source,
  activeStyle,
  compact = false,
}: CitationPreviewProps) {
  const previews = generateCitationPreviewSet(source);

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {previews.map((preview) => (
        <Card
          key={preview.style}
          className={
            preview.style === activeStyle
              ? "border-primary/40 bg-primary/5"
              : "border-border/70 bg-background/70"
          }
        >
          <CardHeader className={compact ? "pb-3" : undefined}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="font-serif text-xl tracking-tight">
                {preview.label}
              </CardTitle>
              <div className="flex items-center gap-2">
                {preview.style === activeStyle ? (
                  <Badge variant="secondary" className="rounded-full">
                    Preferred
                  </Badge>
                ) : null}
                <CopyButton text={preview.citation} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-7">{preview.citation}</p>
          </CardContent>
        </Card>
      ))}
      {!compact && (
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {citationStyles.map((style) => (
            <Badge key={style.key} variant="outline" className="rounded-full">
              {getStyleLabel(style.key)}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
