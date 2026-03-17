import { EmptyState } from "@/components/app/empty-state";
import { NoteCard } from "@/components/app/note-card";
import { NoteFormDialog } from "@/components/app/note-form-dialog";
import { PageHeader } from "@/components/app/page-header";
import { getNotesData } from "@/lib/data/citemate";

export default async function NotesPage() {
  const { notes, sources } = await getNotesData();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Writing support"
        title="Notes"
        description="Save article summaries, quotes, and synthesis drafts in clean multiline notes connected to your sources."
        actions={<NoteFormDialog sources={sources} />}
      />
      {notes.length === 0 ? (
        <EmptyState
          title="No notes saved yet"
          description="Create a note while reading to preserve quotes, arguments, and your own interpretation."
          action={<NoteFormDialog sources={sources} />}
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} sources={sources} />
          ))}
        </div>
      )}
    </div>
  );
}
