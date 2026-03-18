import Link from "next/link";
import { Search } from "lucide-react";

import { NotesAssistantWorkspace } from "@/components/ai/notes-assistant-workspace";
import { EmptyState } from "@/components/app/empty-state";
import { NoteFormDialog } from "@/components/app/note-form-dialog";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getNotesData } from "@/lib/data/citemate";

type NotesPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const params = await searchParams;
  const { notes, sources, query } = await getNotesData(params.q);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Writing support"
        title="Notes"
        description="Save article summaries, quotes, synthesis drafts, and RRL notes in clean multiline notes connected to your sources."
        actions={<NoteFormDialog sources={sources} />}
      />
      <Card className="border-border/70 bg-card/90">
        <CardContent className="space-y-4 py-5">
          <form className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={params.q}
                placeholder="Search note title, note text, linked source title, abstract, tags, or authors"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="outline">
                Search notes
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/dashboard/notes">Clear</Link>
              </Button>
            </div>
          </form>
          {query ? (
            <p className="text-sm text-muted-foreground">
              Showing note results for <span className="font-medium text-foreground">{query}</span>.
            </p>
          ) : null}
        </CardContent>
      </Card>
      {notes.length === 0 ? (
        <EmptyState
          title={query ? "No notes matched that search" : "No notes saved yet"}
          description={
            query
              ? "Try a different keyword or search by linked source title, tag, abstract, or author."
              : "Create a note while reading to preserve quotes, arguments, thematic synthesis, and your own interpretation."
          }
          action={<NoteFormDialog sources={sources} />}
        />
      ) : (
        <NotesAssistantWorkspace notes={notes} sources={sources} />
      )}
    </div>
  );
}
