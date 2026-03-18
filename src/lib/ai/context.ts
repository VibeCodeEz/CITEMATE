import type {
  Note,
  SourceWithRelations,
  Subject,
} from "@/types/app";
import type { SourceReminder } from "@/lib/reminders/source-reminders";
import type {
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
