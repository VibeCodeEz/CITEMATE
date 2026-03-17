import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  CheckCircle2,
  FileSearch2,
  FolderKanban,
  NotebookPen,
  ScanSearch,
} from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/citemate";
import { getSourceTypeLabel } from "@/lib/validations/source";

const quickActions = [
  {
    title: "Add a source",
    description:
      "Save a journal article, book, or website and keep the citation ready.",
    href: "/dashboard/sources",
    icon: BookOpenText,
  },
  {
    title: "Create a subject",
    description:
      "Group readings by course, assignment, or research theme.",
    href: "/dashboard/subjects",
    icon: FolderKanban,
  },
  {
    title: "Write a note",
    description:
      "Capture a quote, paraphrase, or working argument while reading.",
    href: "/dashboard/notes",
    icon: NotebookPen,
  },
  {
    title: "Review originality",
    description:
      "Run the final writing checklist before submission.",
    href: "/dashboard/checklist",
    icon: ScanSearch,
  },
];

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default async function DashboardPage() {
  const { recentNotes, recentSources, stats } = await getDashboardData();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title="Research dashboard"
        description="See your sources, notes, subjects, and final review progress in one calm workspace built for student research."
      />

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border/70 bg-card/90">
          <CardContent className="space-y-6 py-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <Badge variant="secondary" className="rounded-full">
                  Study snapshot
                </Badge>
                <div className="space-y-2">
                  <h2 className="font-serif text-4xl tracking-tight">
                    Keep your paper organized from first source to final submission
                  </h2>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    CiteMate helps you collect evidence, draft notes, and run a final originality check without bouncing across separate tools.
                  </p>
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-border/80 bg-secondary/35 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Checklist progress
                </p>
                <p className="mt-2 font-serif text-5xl tracking-tight">
                  {stats.checklistCompletion}%
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {stats.checklistCompleted} of {stats.checklistTotal} reviewed
                </p>
              </div>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${stats.checklistCompletion}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/dashboard/sources">
                  Open sources
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/checklist">
                  Continue checklist
                  <CheckCircle2 className="size-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
          {[
            {
              label: "Saved sources",
              value: stats.sources,
              icon: BookOpenText,
            },
            {
              label: "Study notes",
              value: stats.notes,
              icon: NotebookPen,
            },
            {
              label: "Subjects",
              value: stats.subjects,
              icon: FolderKanban,
            },
            {
              label: "Checklist done",
              value: `${stats.checklistCompletion}%`,
              icon: ScanSearch,
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <Card key={stat.label} className="border-border/70 bg-card/90">
                <CardContent className="space-y-3 py-6">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary/60">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="font-serif text-5xl tracking-tight">
                      {stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-border/70 bg-card/90">
          <CardHeader className="flex flex-row items-end justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="font-serif text-3xl tracking-tight">
                Recent sources
              </CardTitle>
              <p className="text-sm leading-6 text-muted-foreground">
                Your latest references, ready for notes and citations.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/sources">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentSources.length === 0 ? (
              <EmptyState
                title="No sources yet"
                description="Start by saving your first paper, article, or website."
                action={
                  <Button asChild>
                    <Link href="/dashboard/sources">Open sources</Link>
                  </Button>
                }
              />
            ) : (
              recentSources.map((source) => (
                <Link
                  key={source.id}
                  href={`/dashboard/sources/${source.id}`}
                  className="block rounded-[1.5rem] border border-border/80 bg-secondary/30 p-4 transition-colors hover:border-primary/30 hover:bg-secondary/45"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="rounded-full">
                          {getSourceTypeLabel(source.source_type)}
                        </Badge>
                        <Badge variant="secondary" className="rounded-full">
                          {source.year ?? "n.d."}
                        </Badge>
                      </div>
                      <h3 className="font-semibold leading-6">{source.title}</h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {source.authors.join(", ")}
                      </p>
                    </div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {formatDateLabel(source.created_at)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90">
          <CardHeader className="flex flex-row items-end justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="font-serif text-3xl tracking-tight">
                Recent notes
              </CardTitle>
              <p className="text-sm leading-6 text-muted-foreground">
                Pick up your latest reading thoughts quickly.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/notes">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentNotes.length === 0 ? (
              <EmptyState
                title="No notes yet"
                description="Use notes to track quotes, summaries, and working ideas while you read."
                action={
                  <Button asChild>
                    <Link href="/dashboard/notes">Open notes</Link>
                  </Button>
                }
              />
            ) : (
              recentNotes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-[1.5rem] border border-border/80 bg-secondary/30 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <h3 className="font-semibold leading-6">{note.title}</h3>
                      <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {note.content}
                      </p>
                    </div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {formatDateLabel(note.updated_at)}
                    </p>
                  </div>
                  {note.source ? (
                    <Badge variant="secondary" className="mt-3 rounded-full">
                      {note.source.title}
                    </Badge>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h2 className="font-serif text-3xl tracking-tight">Quick actions</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Jump into the next task without hunting through the sidebar.
            </p>
          </div>
          <Badge variant="outline" className="rounded-full">
            <FileSearch2 className="mr-1 size-3.5" />
            Built for research workflows
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className="border-border/70 bg-card/90">
                <CardContent className="space-y-4 py-6">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary/60">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <Button variant="outline" asChild className="w-full justify-between">
                    <Link href={item.href}>
                      Open
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
