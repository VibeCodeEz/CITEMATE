import { deleteNoteAction } from "@/actions/notes";
import { DeleteButton } from "@/components/app/delete-button";
import { NoteFormDialog } from "@/components/app/note-form-dialog";
import { Badge } from "@/components/ui/badge";
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
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div>
              <h2
                className={
                  compact
                    ? "font-serif text-2xl tracking-tight"
                    : "font-serif text-3xl tracking-tight"
                }
              >
                {note.title}
              </h2>
              {lockedSource ? null : linkedSource ? (
                <Badge variant="secondary" className="mt-3 rounded-full">
                  {linkedSource.title}
                </Badge>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <span>Created {formatTimestamp(note.created_at)}</span>
              <span>Updated {formatTimestamp(note.updated_at)}</span>
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
        <div className="rounded-[1.5rem] border border-border/80 bg-secondary/25 p-4">
          <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
            {note.content}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
