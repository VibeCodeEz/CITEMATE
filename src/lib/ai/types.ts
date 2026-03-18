export type AssistantTaskType =
  | "summarize_source"
  | "suggest_missing_metadata"
  | "explain_citation"
  | "notes_to_outline"
  | "rewrite_notes"
  | "generate_study_questions"
  | "resolve_reminder";

export type AssistantSourceContext = {
  id: string;
  title: string;
  authors: string[];
  year: number | null;
  journalOrPublisher: string | null;
  url: string | null;
  doi: string | null;
  abstract: string | null;
  sourceType: string;
  citationStylePreference: string;
  tags: string[];
  subjectLabels: string[];
};

export type AssistantNoteContext = {
  id?: string;
  title: string;
  content: string;
};

export type AssistantSubjectContext = {
  id?: string;
  name: string;
  description?: string | null;
};

export type AssistantReminderContext = {
  key: string;
  title: string;
  description: string;
  missingFields: string[];
  sourceTitle?: string;
};

export type AssistantApplyActionType =
  | "copy"
  | "insert_into_note"
  | "use_as_draft"
  | "dismiss";

export type AssistantApplyAction = {
  type: AssistantApplyActionType;
  label: string;
};

export type AssistantSuggestion = {
  label: string;
  value: string;
  reason?: string;
};

export type AssistantResponse = {
  title: string;
  content: string;
  suggestions: AssistantSuggestion[];
  warnings: string[];
  applyActions?: AssistantApplyAction[];
  disclaimer: string;
};

export type AssistantRequest = {
  taskType: AssistantTaskType;
  sourceContext?: AssistantSourceContext;
  noteContext?: AssistantNoteContext;
  subjectContext?: AssistantSubjectContext;
  reminderContext?: AssistantReminderContext;
  userMessage?: string;
};
