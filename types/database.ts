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
          birth_year: number | null;
          phone: string | null;
          public_email: string | null;
          location: string | null;
          github_url: string | null;
          linkedin_url: string | null;
          blog_url: string | null;
          enabled_sections: string[];
          section_order: number[];
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
          birth_year?: number | null;
          phone?: string | null;
          public_email?: string | null;
          location?: string | null;
          github_url?: string | null;
          linkedin_url?: string | null;
          blog_url?: string | null;
          enabled_sections?: string[];
          section_order?: number[];
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
          birth_year?: number | null;
          phone?: string | null;
          public_email?: string | null;
          location?: string | null;
          github_url?: string | null;
          linkedin_url?: string | null;
          blog_url?: string | null;
          enabled_sections?: string[];
          section_order?: number[];
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
          sort_order: number;
        };
        Insert: {
          id?: string;
          profile_id: string;
          name: string;
          proficiency?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          profile_id?: string;
          name?: string;
          proficiency?: string | null;
          sort_order?: number;
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
      careers: {
        Row: {
          id: string;
          profile_id: string;
          company: string;
          position: string | null;
          period: string | null;
          description: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          profile_id: string;
          company: string;
          position?: string | null;
          period?: string | null;
          description?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          profile_id?: string;
          company?: string;
          position?: string | null;
          period?: string | null;
          description?: string | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "careers_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      education: {
        Row: {
          id: string;
          profile_id: string;
          school: string;
          major: string | null;
          degree: string | null;
          status: string | null;
          period: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          profile_id: string;
          school: string;
          major?: string | null;
          degree?: string | null;
          status?: string | null;
          period?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          profile_id?: string;
          school?: string;
          major?: string | null;
          degree?: string | null;
          status?: string | null;
          period?: string | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "education_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      certifications: {
        Row: {
          id: string;
          profile_id: string;
          category: string;
          name: string;
          issuer: string | null;
          acquired_date: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          profile_id: string;
          category?: string;
          name: string;
          issuer?: string | null;
          acquired_date?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          profile_id?: string;
          category?: string;
          name?: string;
          issuer?: string | null;
          acquired_date?: string | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "certifications_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      activities: {
        Row: {
          id: string;
          profile_id: string;
          title: string;
          organization: string | null;
          period: string | null;
          description: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          profile_id: string;
          title: string;
          organization?: string | null;
          period?: string | null;
          description?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          profile_id?: string;
          title?: string;
          organization?: string | null;
          period?: string | null;
          description?: string | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "activities_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      cover_letters: {
        Row: {
          id: string;
          profile_id: string;
          title: string;
          content: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          profile_id: string;
          title: string;
          content?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          profile_id?: string;
          title?: string;
          content?: string | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "cover_letters_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      owner_faqs: {
        Row: {
          id: string;
          profile_id: string;
          question: string;
          answer: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          profile_id: string;
          question: string;
          answer: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          profile_id?: string;
          question?: string;
          answer?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "owner_faqs_profile_id_fkey";
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
export type Career = Tables<"careers">;
export type Education = Tables<"education">;
export type Certification = Tables<"certifications">;
export type CoverLetter = Tables<"cover_letters">;
export type OwnerFaq = Tables<"owner_faqs">;
export type SystemPrompt = Tables<"system_prompts">;
export type ChatSession = Tables<"chat_sessions">;
export type ChatMessage = Tables<"chat_messages">;
export type Report = Tables<"reports">;
