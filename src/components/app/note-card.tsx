import { deleteNoteAction } from "@/actions/notes";
import { NoteMarkdown } from "@/components/app/note-markdown";
import { DeleteButton } from "@/components/app/delete-button";
import { NoteFormDialog } from "@/components/app/note-form-dialog";
import { Card, CardContent } from "@/components/ui/card";
import type { Note, SourceWithRelations } from "@/types/app";

type NoteCardProps = {
  note: Note;
  sources: SourceWithRelations[];
  compact?: boolean;
  lockedSource?: SourceWithRelations;
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

export function NoteCard({
  note,
  sources,
  compact = false,
  lockedSource,
}: NoteCardProps) {
  const linkedSource =
    lockedSource ?? sources.find((source) => source.id === note.source_id) ?? null;

  return (
    <Card className="border-border/70 bg-card/90">
      <CardContent className={compact ? "space-y-4 py-5" : "space-y-4 py-6"}>
        <div className="space-y-4">
          <div className="min-w-0 space-y-3">
            <h2
              className={
                compact
                  ? "break-words font-serif text-2xl tracking-tight"
                  : "break-words font-serif text-3xl tracking-tight"
              }
            >
              {note.title}
            </h2>
            {lockedSource ? null : linkedSource ? (
              <div
                className="w-full max-w-full rounded-full border border-border/80 bg-secondary/40 px-3 py-2 text-sm leading-5 text-muted-foreground break-words"
                title={linkedSource.title}
              >
                {linkedSource.title}
              </div>
            ) : null}
            <div className="grid gap-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground sm:flex sm:flex-wrap sm:gap-3">
              <span className="break-words">Created {formatTimestamp(note.created_at)}</span>
              <span className="break-words">Updated {formatTimestamp(note.updated_at)}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <NoteFormDialog
              note={note}
              sources={sources}
              lockedSourceId={lockedSource?.id}
              lockedSourceTitle={lockedSource?.title}
            />
            <DeleteButton
              id={note.id}
              itemLabel={note.title}
              onDelete={deleteNoteAction}
            />
          </div>
        </div>
        <div className="min-w-0 overflow-hidden rounded-[1.5rem] border border-border/80 bg-secondary/25 p-4">
          <NoteMarkdown content={note.content} className="break-words" />
        </div>
      </CardContent>
    </Card>
  );
}
