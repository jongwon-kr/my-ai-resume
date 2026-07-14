export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          description: string | null
          id: string
          organization: string | null
          period: string | null
          profile_id: string
          sort_order: number
          title: string
        }
        Insert: {
          description?: string | null
          id?: string
          organization?: string | null
          period?: string | null
          profile_id: string
          sort_order?: number
          title: string
        }
        Update: {
          description?: string | null
          id?: string
          organization?: string | null
          period?: string | null
          profile_id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      careers: {
        Row: {
          company: string
          description: string | null
          id: string
          period: string | null
          position: string | null
          profile_id: string
          sort_order: number
        }
        Insert: {
          company: string
          description?: string | null
          id?: string
          period?: string | null
          position?: string | null
          profile_id: string
          sort_order?: number
        }
        Update: {
          company?: string
          description?: string | null
          id?: string
          period?: string | null
          position?: string | null
          profile_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "careers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          acquired_date: string | null
          category: string
          id: string
          issuer: string | null
          name: string
          profile_id: string
          sort_order: number
        }
        Insert: {
          acquired_date?: string | null
          category?: string
          id?: string
          issuer?: string | null
          name: string
          profile_id: string
          sort_order?: number
        }
        Update: {
          acquired_date?: string | null
          category?: string
          id?: string
          issuer?: string | null
          name?: string
          profile_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "certifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          session_type: string
          visitor_hash: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          session_type?: string
          visitor_hash?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          session_type?: string
          visitor_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cover_letters: {
        Row: {
          content: string | null
          id: string
          profile_id: string
          sort_order: number
          title: string
        }
        Insert: {
          content?: string | null
          id?: string
          profile_id: string
          sort_order?: number
          title: string
        }
        Update: {
          content?: string | null
          id?: string
          profile_id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "cover_letters_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      editor_document_versions: {
        Row: {
          created_at: string
          document: Json
          id: string
          profile_id: string
          summary_text: string | null
          version: number
        }
        Insert: {
          created_at?: string
          document: Json
          id?: string
          profile_id: string
          summary_text?: string | null
          version: number
        }
        Update: {
          created_at?: string
          document?: Json
          id?: string
          profile_id?: string
          summary_text?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "editor_document_versions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      editor_documents: {
        Row: {
          created_at: string
          draft_document: Json
          id: string
          profile_id: string
          published_document: Json | null
          published_version: number
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          draft_document?: Json
          id?: string
          profile_id: string
          published_document?: Json | null
          published_version?: number
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          draft_document?: Json
          id?: string
          profile_id?: string
          published_document?: Json | null
          published_version?: number
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "editor_documents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      education: {
        Row: {
          degree: string | null
          id: string
          major: string | null
          period: string | null
          profile_id: string
          school: string
          sort_order: number
          status: string | null
        }
        Insert: {
          degree?: string | null
          id?: string
          major?: string | null
          period?: string | null
          profile_id: string
          school: string
          sort_order?: number
          status?: string | null
        }
        Update: {
          degree?: string | null
          id?: string
          major?: string | null
          period?: string | null
          profile_id?: string
          school?: string
          sort_order?: number
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "education_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          chat_session_id: string | null
          created_at: string
          id: string
          profile_id: string
          question: string
          visitor_email: string
          visitor_name: string | null
        }
        Insert: {
          chat_session_id?: string | null
          created_at?: string
          id?: string
          profile_id: string
          question: string
          visitor_email: string
          visitor_name?: string | null
        }
        Update: {
          chat_session_id?: string | null
          created_at?: string
          id?: string
          profile_id?: string
          question?: string
          visitor_email?: string
          visitor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_chat_session_id_fkey"
            columns: ["chat_session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_faqs: {
        Row: {
          answer: string
          id: string
          match_mode: string
          profile_id: string
          question: string
          sort_order: number
        }
        Insert: {
          answer: string
          id?: string
          match_mode?: string
          profile_id: string
          question: string
          sort_order?: number
        }
        Update: {
          answer?: string
          id?: string
          match_mode?: string
          profile_id?: string
          question?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "owner_faqs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          created_at: string
          draft_document: Json
          id: string
          profile_id: string
          published_document: Json | null
          published_summary: string | null
          published_version: number
          resume_imported_at: string | null
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          draft_document?: Json
          id?: string
          profile_id: string
          published_document?: Json | null
          published_summary?: string | null
          published_version?: number
          resume_imported_at?: string | null
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          draft_document?: Json
          id?: string
          profile_id?: string
          published_document?: Json | null
          published_summary?: string | null
          published_version?: number
          resume_imported_at?: string | null
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_daily_stats: {
        Row: {
          profile_id: string
          stat_date: string
          views: number
        }
        Insert: {
          profile_id: string
          stat_date?: string
          views?: number
        }
        Update: {
          profile_id?: string
          stat_date?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "profile_daily_stats_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_links: {
        Row: {
          id: string
          label: string
          profile_id: string
          sort_order: number
          url: string
        }
        Insert: {
          id?: string
          label: string
          profile_id: string
          sort_order?: number
          url: string
        }
        Update: {
          id?: string
          label?: string
          profile_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_links_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_year: number | null
          created_at: string
          enabled_sections: string[]
          id: string
          intro: string | null
          is_private: boolean
          label: string | null
          location: string | null
          name: string
          owner_id: string
          phone: string | null
          portfolio_published_at: string | null
          portfolio_summary: string | null
          portfolio_version: number
          public_email: string | null
          role_title: string | null
          section_order: number[]
          show_exact_age: boolean
          show_phone: boolean
          slug: string
          status: string
          suggest_top_questions_in_chat: boolean
          updated_at: string
          view_count: number
        }
        Insert: {
          avatar_url?: string | null
          birth_year?: number | null
          created_at?: string
          enabled_sections?: string[]
          id?: string
          intro?: string | null
          is_private?: boolean
          label?: string | null
          location?: string | null
          name?: string
          owner_id: string
          phone?: string | null
          portfolio_published_at?: string | null
          portfolio_summary?: string | null
          portfolio_version?: number
          public_email?: string | null
          role_title?: string | null
          section_order?: number[]
          show_exact_age?: boolean
          show_phone?: boolean
          slug: string
          status?: string
          suggest_top_questions_in_chat?: boolean
          updated_at?: string
          view_count?: number
        }
        Update: {
          avatar_url?: string | null
          birth_year?: number | null
          created_at?: string
          enabled_sections?: string[]
          id?: string
          intro?: string | null
          is_private?: boolean
          label?: string | null
          location?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          portfolio_published_at?: string | null
          portfolio_summary?: string | null
          portfolio_version?: number
          public_email?: string | null
          role_title?: string | null
          section_order?: number[]
          show_exact_age?: boolean
          show_phone?: boolean
          slug?: string
          status?: string
          suggest_top_questions_in_chat?: boolean
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      projects: {
        Row: {
          actions: string | null
          id: string
          period: string | null
          profile_id: string
          results: string | null
          role: string | null
          situation: string | null
          sort_order: number
          tech_stack: string | null
          title: string
          troubleshooting: string | null
        }
        Insert: {
          actions?: string | null
          id?: string
          period?: string | null
          profile_id: string
          results?: string | null
          role?: string | null
          situation?: string | null
          sort_order?: number
          tech_stack?: string | null
          title: string
          troubleshooting?: string | null
        }
        Update: {
          actions?: string | null
          id?: string
          period?: string | null
          profile_id?: string
          results?: string | null
          role?: string | null
          situation?: string | null
          sort_order?: number
          tech_stack?: string | null
          title?: string
          troubleshooting?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          detail: string | null
          id: string
          profile_id: string | null
          reason: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          id?: string
          profile_id?: string | null
          reason?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          id?: string
          profile_id?: string | null
          reason?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          id: string
          name: string
          proficiency: string | null
          profile_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          proficiency?: string | null
          profile_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          proficiency?: string | null
          profile_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_prompts: {
        Row: {
          content: string
          created_at: string
          id: string
          profile_id: string
          version: number
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          profile_id: string
          version: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          profile_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "system_prompts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_profile_view: {
        Args: { p_profile_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

export type ProfileStatus = "draft" | "published";
export type ChatMessageRole = "user" | "assistant";
export type ProfileLink = Tables<"profile_links">;
export type Profile = Tables<"profiles">;
export type Skill = Tables<"skills">;
export type Project = Tables<"projects">;
export type ChatSession = Tables<"chat_sessions">;
export type ChatMessage = Tables<"chat_messages">;
export type SystemPrompt = Tables<"system_prompts">;
export type Report = Tables<"reports">;
