export type AssistantTaskType =
  | "summarize_source"
  | "suggest_missing_metadata"
  | "explain_citation"
  | "notes_to_outline"
  | "rewrite_notes"
  | "generate_study_questions"
  | "resolve_reminder"
  | "discover_literature"
  | "build_rrl_note"
  | "group_sources_by_theme"
  | "build_related_studies_matrix"
  | "generate_rrl_outline"
  | "find_research_gaps";

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

export type AssistantCollectionSourceContext = {
  title: string;
  authors: string[];
  year: number | null;
  abstract: string | null;
  sourceType: string;
  tags: string[];
};

export type AssistantCollectionNoteContext = {
  title: string;
  excerpt: string;
  sourceTitle?: string | null;
};

export type AssistantCollectionContext = {
  label: string;
  description?: string | null;
  sourceCount: number;
  noteCount: number;
  sources: AssistantCollectionSourceContext[];
  notes: AssistantCollectionNoteContext[];
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
  collectionContext?: AssistantCollectionContext;
  reminderContext?: AssistantReminderContext;
  userMessage?: string;
};
