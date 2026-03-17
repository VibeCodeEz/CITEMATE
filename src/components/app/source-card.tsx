"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ExternalLink, FileText, NotebookPen } from "lucide-react";

import { deleteSourceAction } from "@/actions/sources";
import { CopyButton } from "@/components/app/copy-button";
import { DeleteButton } from "@/components/app/delete-button";
import { SourceFormDialog } from "@/components/app/source-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { citationStyles, formatCitation, getStyleLabel } from "@/lib/citations";
import { getSourceTypeLabel } from "@/lib/validations/source";
import type {
  CitationStyle,
  SourceWithRelations,
  SubjectWithCount,
} from "@/types/app";

type SourceCardProps = {
  source: SourceWithRelations;
  subjects: SubjectWithCount[];
  selectionControl?: ReactNode;
};

export function SourceCard({
  source,
  subjects,
  selectionControl,
}: SourceCardProps) {
  const [style, setStyle] = useState<CitationStyle>(source.citation_style);
  const citation = formatCitation(source, style);

  return (
    <Card className="border-border/70 bg-card/90 shadow-sm shadow-teal-950/5">
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            {selectionControl ? <div className="pt-1">{selectionControl}</div> : null}
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full">
                  {getSourceTypeLabel(source.source_type)}
                </Badge>
                {source.subjects.map((subject) => (
                  <Badge
                    key={subject.id}
                    variant="secondary"
                    className="rounded-full"
                    style={{
                      backgroundColor: `${subject.color}1A`,
                      color: subject.color,
                      borderColor: `${subject.color}40`,
                    }}
                  >
                    {subject.name}
                  </Badge>
                ))}
              </div>
              <CardTitle className="break-words font-serif text-2xl leading-tight">
                <Link
                  href={`/dashboard/sources/${source.id}`}
                  className="break-words transition-colors hover:text-primary"
                >
                  {source.title}
                </Link>
              </CardTitle>
              <p className="text-sm leading-6 text-muted-foreground">
                {source.authors.join(", ")}
                {source.year ? ` | ${source.year}` : ""}
                {source.publisher ? ` | ${source.publisher}` : ""}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <SourceFormDialog source={source} subjects={subjects} />
            <DeleteButton
              itemLabel={source.title}
              onDelete={deleteSourceAction}
              id={source.id}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-3xl border border-border/80 bg-secondary/40 p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            {citationStyles.map((citationStyle) => (
              <Button
                key={citationStyle.key}
                type="button"
                size="sm"
                variant={citationStyle.key === style ? "default" : "outline"}
                onClick={() => setStyle(citationStyle.key)}
              >
                {citationStyle.label}
              </Button>
            ))}
          </div>
          <p className="text-sm leading-7">{citation}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <CopyButton text={citation} />
            <Badge variant="outline" className="rounded-full">
              Default: {getStyleLabel(source.citation_style)}
            </Badge>
          </div>
        </div>
        {source.abstract ? (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Abstract
            </h3>
            <p className="text-sm leading-7 text-muted-foreground">
              {source.abstract}
            </p>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {source.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="rounded-full">
              #{tag}
            </Badge>
          ))}
        </div>
        <div className="grid gap-3 rounded-3xl border border-border/80 bg-background/70 p-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              DOI
            </p>
            <p className="mt-1 break-all text-muted-foreground">
              {source.doi ?? "Not added"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Preferred style
            </p>
            <p className="mt-1 text-muted-foreground">
              {getStyleLabel(source.citation_style)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Subject count
            </p>
            <p className="mt-1 text-muted-foreground">
              {source.subjects.length} subject
              {source.subjects.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-3 border-t border-border/80 pt-5">
        <Button variant="outline" asChild>
          <Link href={`/dashboard/sources/${source.id}`}>Details</Link>
        </Button>
        {source.url ? (
          <Button variant="outline" asChild>
            <Link href={source.url} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" />
              Visit source
            </Link>
          </Button>
        ) : null}
        {source.file_path ? (
          <Button variant="outline" asChild>
            <Link href={`/api/source-files/${source.id}`}>
              <FileText className="size-4" />
              {source.file_name ?? "Attachment"}
            </Link>
          </Button>
        ) : null}
        <Badge variant="secondary" className="rounded-full">
          <NotebookPen className="mr-1 size-3.5" />
          {source.notes.length} note{source.notes.length === 1 ? "" : "s"}
        </Badge>
      </CardFooter>
    </Card>
  );
}
