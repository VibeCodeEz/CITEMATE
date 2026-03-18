"use client";

import { useMemo, useState } from "react";
import { Download, LayoutGrid, TableProperties } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadTextFile } from "@/lib/download/text";
import {
  buildLiteratureReviewMarkdown,
  buildRelatedStudiesMatrix,
  buildThemeBoards,
} from "@/lib/rrl/workspace";
import type { SourceWithRelations, SubjectWithCount } from "@/types/app";

type SubjectResearchToolkitProps = {
  subjects: SubjectWithCount[];
  sources: SourceWithRelations[];
};

export function SubjectResearchToolkit({
  subjects,
  sources,
}: SubjectResearchToolkitProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id ?? null);
  const selectedSubject =
    subjects.find((subject) => subject.id === selectedSubjectId) ?? subjects[0] ?? null;

  const subjectSources = useMemo(() => {
    if (!selectedSubject) {
      return [];
    }

    return sources.filter((source) =>
      source.subjects.some((subject) => subject.id === selectedSubject.id),
    );
  }, [selectedSubject, sources]);

  const matrixRows = useMemo(
    () => buildRelatedStudiesMatrix(subjectSources),
    [subjectSources],
  );
  const boards = useMemo(() => buildThemeBoards(subjectSources), [subjectSources]);

  if (!selectedSubject) {
    return null;
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Research toolkit
          </p>
          <h2 className="font-serif text-3xl tracking-tight">
            Related studies, themes, and export
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Use your saved subject sources to compare studies, see recurring themes, and export a literature review pack.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const content = buildLiteratureReviewMarkdown({
              subject: selectedSubject,
              sources: subjectSources,
            });

            downloadTextFile({
              content,
              fileName: `${selectedSubject.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "subject"}-literature-review-pack.md`,
              mimeType: "text/markdown;charset=utf-8",
            });
            toast.success("Downloaded literature review export.");
          }}
          disabled={subjectSources.length === 0}
        >
          <Download className="size-4" />
          Export literature review
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {subjects.map((subject) => (
          <Button
            key={subject.id}
            type="button"
            size="sm"
            variant={subject.id === selectedSubject.id ? "default" : "outline"}
            onClick={() => setSelectedSubjectId(subject.id)}
          >
            {subject.name}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-3xl tracking-tight">
              <TableProperties className="size-5 text-primary" />
              Related studies matrix
            </CardTitle>
          </CardHeader>
          <CardContent>
            {matrixRows.length === 0 ? (
              <p className="text-sm leading-6 text-muted-foreground">
                Add sources to this subject to build the matrix.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-[1.5rem] border border-border/80">
                <table className="min-w-full text-sm">
                  <thead className="bg-secondary/35 text-left">
                    <tr>
                      {["Source", "Year", "Method", "Sample", "Findings", "Gap"].map((heading) => (
                        <th key={heading} className="px-4 py-3 font-semibold">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrixRows.map((row) => (
                      <tr key={row.sourceId} className="border-t border-border/80 align-top">
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <p className="font-medium">{row.title}</p>
                            <p className="text-xs text-muted-foreground">{row.authors}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{row.year}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.method}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.sample}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.findings}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.researchGap}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-3xl tracking-tight">
              <LayoutGrid className="size-5 text-primary" />
              Theme boards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {boards.length === 0 ? (
              <p className="text-sm leading-6 text-muted-foreground">
                Add tags to your sources to make the theme boards more useful.
              </p>
            ) : (
              boards.slice(0, 8).map((board) => (
                <div
                  key={board.theme}
                  className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-full">
                      {board.sources.length} source{board.sources.length === 1 ? "" : "s"}
                    </Badge>
                    <p className="font-medium capitalize">{board.theme}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {board.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {board.sources.map((source) => (
                      <Badge key={`${board.theme}-${source.id}`} variant="outline" className="rounded-full">
                        {source.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
