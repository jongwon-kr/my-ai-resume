/**
 * Temporary Database types — replace with output of:
 *   supabase gen types typescript --local > types/database.ts
 * or (remote):
 *   supabase gen types typescript --project-id <ref> > types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProfileStatus = "draft" | "published";
export type ChatMessageRole = "user" | "assistant";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          slug: string;
          name: string;
          role_title: string | null;
          intro: string | null;
          avatar_url: string | null;
          is_private: boolean;
          status: ProfileStatus;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          slug: string;
          name?: string;
          role_title?: string | null;
          intro?: string | null;
          avatar_url?: string | null;
          is_private?: boolean;
          status?: ProfileStatus;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          role_title?: string | null;
          intro?: string | null;
          avatar_url?: string | null;
          is_private?: boolean;
          status?: ProfileStatus;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      skills: {
        Row: {
          id: string;
          profile_id: string;
          name: string;
          proficiency: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          name: string;
          proficiency?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          name?: string;
          proficiency?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "skills_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          id: string;
          profile_id: string;
          title: string;
          period: string | null;
          role: string | null;
          tech_stack: string | null;
          situation: string | null;
          actions: string | null;
          results: string | null;
          troubleshooting: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          profile_id: string;
          title: string;
          period?: string | null;
          role?: string | null;
          tech_stack?: string | null;
          situation?: string | null;
          actions?: string | null;
          results?: string | null;
          troubleshooting?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          profile_id?: string;
          title?: string;
          period?: string | null;
          role?: string | null;
          tech_stack?: string | null;
          situation?: string | null;
          actions?: string | null;
          results?: string | null;
          troubleshooting?: string | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "projects_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      system_prompts: {
        Row: {
          id: string;
          profile_id: string;
          content: string;
          version: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          content: string;
          version: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          content?: string;
          version?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "system_prompts_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_sessions: {
        Row: {
          id: string;
          profile_id: string;
          visitor_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          visitor_hash?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          visitor_hash?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_sessions_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          role: ChatMessageRole;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: ChatMessageRole;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          role?: ChatMessageRole;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "chat_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: {
          id: string;
          profile_id: string | null;
          reason: string | null;
          detail: string | null;
          status: string;
          resolved_at: string | null;
          resolved_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          reason?: string | null;
          detail?: string | null;
          status?: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string | null;
          reason?: string | null;
          detail?: string | null;
          status?: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profile_daily_stats: {
        Row: {
          profile_id: string;
          stat_date: string;
          views: number;
        };
        Insert: {
          profile_id: string;
          stat_date?: string;
          views?: number;
        };
        Update: {
          profile_id?: string;
          stat_date?: string;
          views?: number;
        };
        Relationships: [
          {
            foreignKeyName: "profile_daily_stats_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_profile_view: {
        Args: { p_profile_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Profile = Tables<"profiles">;
export type Skill = Tables<"skills">;
export type Project = Tables<"projects">;
export type SystemPrompt = Tables<"system_prompts">;
export type ChatSession = Tables<"chat_sessions">;
export type ChatMessage = Tables<"chat_messages">;
export type Report = Tables<"reports">;
