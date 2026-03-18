"use client";

import { useMemo, useState } from "react";

import { ResearchAssistantPanel } from "@/components/ai/research-assistant-panel";
import { Button } from "@/components/ui/button";
import type { AssistantTaskType } from "@/lib/ai/types";
import {
  mapCollectionToAssistantContext,
  mapSubjectToAssistantContext,
} from "@/lib/ai/context";
import type { SourceWithRelations, SubjectWithCount } from "@/types/app";

type SubjectsAssistantWorkspaceProps = {
  subjects: SubjectWithCount[];
  sources: SourceWithRelations[];
};

const subjectTasks: AssistantTaskType[] = [
  "discover_literature",
  "group_sources_by_theme",
  "build_related_studies_matrix",
  "generate_rrl_outline",
  "find_research_gaps",
];

export function SubjectsAssistantWorkspace({
  subjects,
  sources,
}: SubjectsAssistantWorkspaceProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id ?? null);
  const selectedSubject =
    subjects.find((subject) => subject.id === selectedSubjectId) ?? subjects[0] ?? null;

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
        "A subject-focused collection for literature review synthesis.",
      sources: relatedSources,
    });
  }, [selectedSubject, sources]);

  if (!selectedSubject || !collectionContext) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          RRL assistant focus
        </p>
        <div className="flex flex-wrap gap-2">
          {subjects.slice(0, 8).map((subject) => (
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
      </div>
      <ResearchAssistantPanel
        title="RRL Assistant"
        description="Use a whole subject collection to discover literature, cluster studies by theme, build a related studies matrix, draft an RRL outline, and surface likely research gaps."
        tasks={subjectTasks}
        subjectContext={subjectContext}
        collectionContext={collectionContext}
        draftLabel="RRL assistant draft"
      />
    </section>
  );
}
