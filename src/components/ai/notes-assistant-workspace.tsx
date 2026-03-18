"use client";

import { useMemo, useState } from "react";

import { ResearchAssistantPanel } from "@/components/ai/research-assistant-panel";
import { NoteCard } from "@/components/app/note-card";
import { Button } from "@/components/ui/button";
import type { AssistantTaskType } from "@/lib/ai/types";
import {
  mapCollectionToAssistantContext,
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
  "build_rrl_note",
  "notes_to_outline",
  "rewrite_notes",
  "group_sources_by_theme",
  "build_related_studies_matrix",
  "generate_rrl_outline",
  "find_research_gaps",
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
  const collectionContext = useMemo(() => {
    if (!selectedSubject) {
      return undefined;
    }

    const relatedSources = sources.filter((source) =>
      source.subjects.some((subject) => subject.id === selectedSubject.id),
    );

    return mapCollectionToAssistantContext({
      label: `${selectedSubject.name} literature set`,
      description:
        selectedSubject.description ??
        "Sources and notes linked to the current subject.",
      sources: relatedSources,
    });
  }, [selectedSubject, sources]);

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
              collectionContext={collectionContext}
              draftLabel="Note draft"
              description="Use the current note and related subject materials to build RRL notes, outlines, theme groupings, studies matrices, gap analysis, or cleaner study notes. Suggestions stay separate until you choose to use them."
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
