import type { Database } from "@/lib/supabase/database.types";

export type CitationStyle = Database["public"]["Enums"]["citation_style"];
export type SourceType = Database["public"]["Enums"]["source_type"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Subject = Database["public"]["Tables"]["subjects"]["Row"];
export type Source = Database["public"]["Tables"]["sources"]["Row"];
export type Note = Database["public"]["Tables"]["notes"]["Row"];
export type SourceVersionRow = Database["public"]["Tables"]["source_versions"]["Row"];
export type NoteVersionRow = Database["public"]["Tables"]["note_versions"]["Row"];
export type ChecklistItem = Database["public"]["Tables"]["checklist_items"]["Row"];
export type ChecklistProgress =
  Database["public"]["Tables"]["checklist_progress"]["Row"];
export type SourceReminderDismissal =
  Database["public"]["Tables"]["source_reminder_dismissals"]["Row"];

export type SourceWithRelations = Source & {
  subjects: Subject[];
  notes: Note[];
};

export type SourceVersionSnapshot = {
  title: string;
  authors: string[];
  year: number | null;
  publisher: string | null;
  url: string | null;
  doi: string | null;
  tags: string[];
  abstract: string | null;
  source_type: SourceType;
  citation_style: CitationStyle;
  subject_ids: string[];
};

export type NoteVersionSnapshot = {
  title: string;
  content: string;
  source_id: string | null;
};

export type SourceVersion = Omit<SourceVersionRow, "snapshot"> & {
  snapshot: SourceVersionSnapshot;
};

export type NoteVersion = Omit<NoteVersionRow, "snapshot"> & {
  snapshot: NoteVersionSnapshot;
};

export type SubjectWithCount = Subject & {
  sourceCount: number;
};

export type ChecklistItemWithProgress = ChecklistItem & {
  completed: boolean;
  progress_updated_at: string | null;
};
