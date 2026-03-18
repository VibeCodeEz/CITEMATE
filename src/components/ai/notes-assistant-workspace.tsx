"use client";

import { useMemo, useState } from "react";

import { ResearchAssistantPanel } from "@/components/ai/research-assistant-panel";
import { NoteCard } from "@/components/app/note-card";
import { Button } from "@/components/ui/button";
import type { AssistantTaskType } from "@/lib/ai/types";
import {
  mapNoteToAssistantContext,
  mapSourceToAssistantContext,
  mapSubjectToAssistantContext,
} from "@/lib/ai/context";
import type { NoteVersion, SourceWithRelations } from "@/types/app";

type NotesAssistantWorkspaceProps = {
  notes: Array<{
    id: string;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
    source_id: string | null;
    user_id: string;
    source: { id: string } | null;
    versions: NoteVersion[];
  }>;
  sources: SourceWithRelations[];
};

const noteTasks: AssistantTaskType[] = [
  "notes_to_outline",
  "rewrite_notes",
  "generate_study_questions",
];

export function NotesAssistantWorkspace({
  notes,
  sources,
}: NotesAssistantWorkspaceProps) {
  const [selectedNoteId, setSelectedNoteId] = useState(notes[0]?.id ?? null);
  const selectedNote = notes.find((note) => note.id === selectedNoteId) ?? notes[0] ?? null;
  const selectedSource =
    sources.find((source) => source.id === selectedNote?.source?.id) ?? null;
  const selectedSubject = selectedSource?.subjects[0] ?? null;

  const noteContext = useMemo(
    () => (selectedNote ? mapNoteToAssistantContext(selectedNote) : undefined),
    [selectedNote],
  );
  const sourceContext = useMemo(
    () => (selectedSource ? mapSourceToAssistantContext(selectedSource) : undefined),
    [selectedSource],
  );
  const subjectContext = useMemo(
    () => mapSubjectToAssistantContext(selectedSubject),
    [selectedSubject],
  );

  return (
    <div className="space-y-8">
      {selectedNote ? (
        <section className="grid gap-6 2xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Assistant focus
              </p>
              <div className="flex flex-wrap gap-2">
                {notes.slice(0, 8).map((note) => (
                  <Button
                    key={note.id}
                    type="button"
                    size="sm"
                    variant={note.id === selectedNote.id ? "default" : "outline"}
                    onClick={() => setSelectedNoteId(note.id)}
                  >
                    {note.title}
                  </Button>
                ))}
              </div>
            </div>
            <ResearchAssistantPanel
              tasks={noteTasks}
              noteContext={noteContext}
              sourceContext={sourceContext}
              subjectContext={subjectContext}
              draftLabel="Note draft"
              description="Use the current note to build outlines, cleaner study notes, or review questions. Suggestions stay separate until you choose to use them."
            />
          </div>
          <div className="grid gap-5 xl:grid-cols-1">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                sources={sources}
                versions={note.versions}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
