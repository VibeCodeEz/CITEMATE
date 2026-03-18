import type {
  Note,
  SourceWithRelations,
  Subject,
} from "@/types/app";
import type { SourceReminder } from "@/lib/reminders/source-reminders";
import type {
  AssistantCollectionContext,
  AssistantNoteContext,
  AssistantReminderContext,
  AssistantSourceContext,
  AssistantSubjectContext,
} from "@/lib/ai/types";

const reminderFieldMap: Record<string, string[]> = {
  missing_author: ["authors"],
  missing_year: ["year"],
  missing_title: ["title"],
  missing_abstract: ["abstract"],
  missing_link: ["url or doi"],
  missing_publisher: ["journal or publisher"],
  missing_website_url: ["url"],
};

export function mapSourceToAssistantContext(
  source: SourceWithRelations,
): AssistantSourceContext {
  return {
    id: source.id,
    title: source.title,
    authors: source.authors,
    year: source.year,
    journalOrPublisher: source.publisher,
    url: source.url,
    doi: source.doi,
    abstract: source.abstract,
    sourceType: source.source_type,
    citationStylePreference: source.citation_style,
    tags: source.tags,
    subjectLabels: source.subjects.map((subject) => subject.name),
  };
}

export function mapNoteToAssistantContext(note: Pick<Note, "id" | "title" | "content">): AssistantNoteContext {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
  };
}

export function mapSubjectToAssistantContext(
  subject?: Pick<Subject, "id" | "name" | "description"> | null,
): AssistantSubjectContext | undefined {
  if (!subject) {
    return undefined;
  }

  return {
    id: subject.id,
    name: subject.name,
    description: subject.description,
  };
}

function truncateText(value: string | null | undefined, maxLength: number) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return "";
  }

  return trimmed.length > maxLength
    ? `${trimmed.slice(0, maxLength).trimEnd()}...`
    : trimmed;
}

export function mapCollectionToAssistantContext(args: {
  label: string;
  description?: string | null;
  sources: SourceWithRelations[];
}): AssistantCollectionContext {
  const notes = args.sources.flatMap((source) =>
    source.notes.map((note) => ({
      title: note.title,
      excerpt: truncateText(note.content, 280),
      sourceTitle: source.title,
    })),
  );

  return {
    label: args.label,
    description: args.description ?? null,
    sourceCount: args.sources.length,
    noteCount: notes.length,
    sources: args.sources.slice(0, 8).map((source) => ({
      title: source.title,
      authors: source.authors.slice(0, 6),
      year: source.year,
      abstract: truncateText(source.abstract, 500) || null,
      sourceType: source.source_type,
      tags: source.tags.slice(0, 6),
    })),
    notes: notes.slice(0, 10),
  };
}

export function mapReminderToAssistantContext(
  reminder: SourceReminder,
): AssistantReminderContext {
  return {
    key: reminder.key,
    title: reminder.title,
    description: reminder.description,
    missingFields: reminderFieldMap[reminder.key] ?? [],
    sourceTitle: reminder.sourceTitle,
  };
}
