import type { Database } from "@/lib/supabase/database.types";

export type CitationStyle = Database["public"]["Enums"]["citation_style"];
export type SourceType = Database["public"]["Enums"]["source_type"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Subject = Database["public"]["Tables"]["subjects"]["Row"];
export type Source = Database["public"]["Tables"]["sources"]["Row"];
export type Note = Database["public"]["Tables"]["notes"]["Row"];
export type ChecklistItem = Database["public"]["Tables"]["checklist_items"]["Row"];
export type ChecklistProgress =
  Database["public"]["Tables"]["checklist_progress"]["Row"];

export type SourceWithRelations = Source & {
  subjects: Subject[];
  notes: Note[];
};

export type SubjectWithCount = Subject & {
  sourceCount: number;
};

export type ChecklistItemWithProgress = ChecklistItem & {
  completed: boolean;
  progress_updated_at: string | null;
};
