export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    CompositeTypes: {
      [_ in never]: never;
    };
    Enums: {
      citation_style:
        | "apa"
        | "mla"
        | "chicago"
        | "harvard"
        | "ieee"
        | "ama"
        | "vancouver"
        | "turabian"
        | "acs"
        | "cse"
        | "oscola"
        | "bluebook"
        | "asa"
        | "apsa"
        | "nlm";
      source_type:
        | "journal_article"
        | "book"
        | "website"
        | "report"
        | "thesis"
        | "conference_paper"
        | "other";
    };
    Functions: {
      delete_current_user: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
    };
    Tables: {
      checklist_items: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          label: string;
          position: number;
          slug: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          label: string;
          position: number;
          slug: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          label?: string;
          position?: number;
          slug?: string;
        };
        Relationships: [];
      };
      checklist_progress: {
        Row: {
          checklist_item_id: string;
          completed: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          checklist_item_id: string;
          completed?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          checklist_item_id?: string;
          completed?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "checklist_progress_checklist_item_id_fkey";
            columns: ["checklist_item_id"];
            referencedRelation: "checklist_items";
            referencedColumns: ["id"];
          },
        ];
      };
      notes: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          source_id: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          source_id?: string | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          source_id?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notes_source_id_fkey";
            columns: ["source_id"];
            referencedRelation: "sources";
            referencedColumns: ["id"];
          },
        ];
      };
      note_versions: {
        Row: {
          created_at: string;
          id: string;
          note_id: string;
          reason: string;
          snapshot: Json;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          note_id: string;
          reason?: string;
          snapshot: Json;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          note_id?: string;
          reason?: string;
          snapshot?: Json;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "note_versions_note_id_fkey";
            columns: ["note_id"];
            referencedRelation: "notes";
            referencedColumns: ["id"];
          },
        ];
      };
      source_reminder_dismissals: {
        Row: {
          dismissed_at: string;
          reminder_key: string;
          source_id: string;
          source_updated_at: string;
          user_id: string;
        };
        Insert: {
          dismissed_at?: string;
          reminder_key: string;
          source_id: string;
          source_updated_at: string;
          user_id: string;
        };
        Update: {
          dismissed_at?: string;
          reminder_key?: string;
          source_id?: string;
          source_updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "source_reminder_dismissals_source_id_fkey";
            columns: ["source_id"];
            referencedRelation: "sources";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      source_subjects: {
        Row: {
          source_id: string;
          subject_id: string;
          user_id: string;
        };
        Insert: {
          source_id: string;
          subject_id: string;
          user_id: string;
        };
        Update: {
          source_id?: string;
          subject_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "source_subjects_source_id_fkey";
            columns: ["source_id"];
            referencedRelation: "sources";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "source_subjects_subject_id_fkey";
            columns: ["subject_id"];
            referencedRelation: "subjects";
            referencedColumns: ["id"];
          },
        ];
      };
      sources: {
        Row: {
          abstract: string | null;
          authors: string[];
          citation_style: Database["public"]["Enums"]["citation_style"];
          created_at: string;
          doi: string | null;
          file_name: string | null;
          file_path: string | null;
          file_size_bytes: number | null;
          file_type: string | null;
          file_uploaded_at: string | null;
          id: string;
          publisher: string | null;
          source_type: Database["public"]["Enums"]["source_type"];
          tags: string[];
          title: string;
          updated_at: string;
          url: string | null;
          user_id: string;
          year: number | null;
        };
        Insert: {
          abstract?: string | null;
          authors?: string[];
          citation_style?: Database["public"]["Enums"]["citation_style"];
          created_at?: string;
          doi?: string | null;
          file_name?: string | null;
          file_path?: string | null;
          file_size_bytes?: number | null;
          file_type?: string | null;
          file_uploaded_at?: string | null;
          id?: string;
          publisher?: string | null;
          source_type?: Database["public"]["Enums"]["source_type"];
          tags?: string[];
          title: string;
          updated_at?: string;
          url?: string | null;
          user_id: string;
          year?: number | null;
        };
        Update: {
          abstract?: string | null;
          authors?: string[];
          citation_style?: Database["public"]["Enums"]["citation_style"];
          created_at?: string;
          doi?: string | null;
          file_name?: string | null;
          file_path?: string | null;
          file_size_bytes?: number | null;
          file_type?: string | null;
          file_uploaded_at?: string | null;
          id?: string;
          publisher?: string | null;
          source_type?: Database["public"]["Enums"]["source_type"];
          tags?: string[];
          title?: string;
          updated_at?: string;
          url?: string | null;
          user_id?: string;
          year?: number | null;
        };
        Relationships: [];
      };
      source_versions: {
        Row: {
          created_at: string;
          id: string;
          reason: string;
          snapshot: Json;
          source_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          reason?: string;
          snapshot: Json;
          source_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          reason?: string;
          snapshot?: Json;
          source_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "source_versions_source_id_fkey";
            columns: ["source_id"];
            referencedRelation: "sources";
            referencedColumns: ["id"];
          },
        ];
      };
      subjects: {
        Row: {
          color: string;
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          color?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          color?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
  };
};
