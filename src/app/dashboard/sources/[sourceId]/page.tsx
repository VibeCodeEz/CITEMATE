import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  LibraryBig,
  NotebookPen,
  Tags,
} from "lucide-react";
import { notFound } from "next/navigation";

import { ResearchAssistantPanel } from "@/components/ai/research-assistant-panel";
import { CitationGeneratorPanel } from "@/components/app/citation-generator-panel";
import { EmptyState } from "@/components/app/empty-state";
import { NoteCard } from "@/components/app/note-card";
import { NoteFormDialog } from "@/components/app/note-form-dialog";
import { PageHeader } from "@/components/app/page-header";
import { SourceAttachmentPanel } from "@/components/app/source-attachment-panel";
import { SourceFormDialog } from "@/components/app/source-form-dialog";
import { SourceVersionHistoryCard } from "@/components/app/source-version-history-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  mapReminderToAssistantContext,
  mapSourceToAssistantContext,
  mapSubjectToAssistantContext,
} from "@/lib/ai/context";
import type { AssistantTaskType } from "@/lib/ai/types";
import { getStyleLabel } from "@/lib/citations";
import { getSourceDetailsData } from "@/lib/data/citemate";
import { buildSourceReminders } from "@/lib/reminders/source-reminders";
import { getSourceTypeLabel } from "@/lib/validations/source";

type SourceDetailsPageProps = {
  params: Promise<{
    sourceId: string;
  }>;
};

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function SourceDetailsPage({
  params,
}: SourceDetailsPageProps) {
  const { sourceId } = await params;
  const { source, subjects, versions, allSources } = await getSourceDetailsData(sourceId);

  if (!source) {
    notFound();
  }

  const sourceReminders = buildSourceReminders(source);
  const sourceContext = mapSourceToAssistantContext(source);
  const subjectContext = mapSubjectToAssistantContext(source.subjects[0]);
  const reminderContext = sourceReminders[0]
    ? mapReminderToAssistantContext(sourceReminders[0])
    : undefined;
  const sourceAssistantTasks: AssistantTaskType[] = [
    "discover_literature",
    "summarize_source",
    "build_rrl_note",
    "suggest_missing_metadata",
    "explain_citation",
    ...(reminderContext ? (["resolve_reminder"] as AssistantTaskType[]) : []),
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Library"
        title={source.title}
        description="Review source metadata, inspect linked notes, build RRL-ready drafts, and generate polished citations without leaving the dashboard."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/sources">
                <ArrowLeft className="size-4" />
                Back to sources
              </Link>
            </Button>
            <SourceFormDialog
              source={source}
              subjects={subjects}
              existingSources={allSources}
            />
          </>
        }
      />
      <section className="grid gap-6 2xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <Card className="border-border/70 bg-card/90">
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full">
                  {getSourceTypeLabel(source.source_type)}
                </Badge>
                <Badge variant="secondary" className="rounded-full">
                  Preferred: {getStyleLabel(source.citation_style)}
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
              <div className="space-y-3">
                <CardTitle className="font-serif text-3xl leading-tight tracking-tight">
                  {source.title}
                </CardTitle>
                <p className="text-sm leading-7 text-muted-foreground">
                  {source.authors.length > 0
                    ? source.authors.join(", ")
                    : "Unknown author"}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.5rem] border border-border/80 bg-secondary/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Journal or publisher
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    {source.publisher ?? "Not added"}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-border/80 bg-secondary/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Publication year
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    {source.year ?? "n.d."}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-border/80 bg-secondary/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    DOI
                  </p>
                  <p className="mt-2 break-all text-sm leading-6 text-foreground">
                    {source.doi ?? "Not added"}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-border/80 bg-secondary/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Updated
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    {formatDateLabel(source.updated_at)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
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
              </div>
            </CardContent>
          </Card>
          {source.file_path && source.file_name ? (
            <SourceAttachmentPanel
              sourceId={source.id}
              fileName={source.file_name}
              fileType={source.file_type}
              fileSizeBytes={source.file_size_bytes}
              fileUploadedAt={source.file_uploaded_at}
            />
          ) : null}
          <SourceVersionHistoryCard sourceId={source.id} versions={versions} />
          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-3xl tracking-tight">
                <LibraryBig className="size-5 text-primary" />
                Abstract
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                {source.abstract ?? "No abstract saved for this source yet."}
              </p>
            </CardContent>
          </Card>
          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="border-border/70 bg-card/90">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-3xl tracking-tight">
                  <Tags className="size-5 text-primary" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                {source.tags.length === 0 ? (
                  <p className="text-sm leading-6 text-muted-foreground">
                    No tags added yet.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {source.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="rounded-full">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border-border/70 bg-card/90 xl:col-span-2">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2 font-serif text-3xl tracking-tight">
                    <NotebookPen className="size-5 text-primary" />
                    Source notes
                  </CardTitle>
                  <NoteFormDialog
                    sources={[source]}
                    lockedSourceId={source.id}
                    lockedSourceTitle={source.title}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {source.notes.length === 0 ? (
                  <EmptyState
                    title="No notes for this source yet"
                    description="Add your first reading note here to keep quotes, paraphrases, and synthesis directly attached to this source."
                    action={
                      <NoteFormDialog
                        sources={[source]}
                        lockedSourceId={source.id}
                        lockedSourceTitle={source.title}
                      />
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {source.notes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        sources={[source]}
                        lockedSource={source}
                        compact
                        versions={[]}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="space-y-6">
          <CitationGeneratorPanel source={source} />
          <ResearchAssistantPanel
            tasks={sourceAssistantTasks}
            sourceContext={sourceContext}
            subjectContext={subjectContext}
            reminderContext={reminderContext}
            draftLabel="Source assistant draft"
            description="Get source-specific help for literature discovery, RRL note building, summaries, missing metadata, subject or tag suggestions, and citation guidance. Suggestions never update saved fields automatically."
          />
        </div>
      </section>
    </div>
  );
}
