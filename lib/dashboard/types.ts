import type { ChatMessageRole, ProfileStatus } from "@/types/database";
import type { ResumeCompletionResult } from "@/lib/resume/completion";
import type { TopQuestion } from "@/lib/dashboard/top-questions";

export interface OwnerProfile {
  id: string;
  slug: string;
  name: string;
  role_title: string | null;
  status: ProfileStatus;
  is_private: boolean;
  view_count: number;
}

export interface DashboardSession {
  id: string;
  created_at: string;
  message_count: number;
  preview: string | null;
}

export interface DashboardMessage {
  id: string;
  session_id: string;
  role: ChatMessageRole;
  content: string;
  created_at: string;
}

export interface DailyTrendPoint {
  date: string;
  label: string;
  views: number;
  sessions: number;
}

export interface DashboardStats {
  view_count: number;
  session_count: number;
  trend: DailyTrendPoint[];
  top_questions: TopQuestion[];
}

export interface DashboardData {
  profile: OwnerProfile;
  sessions: DashboardSession[];
  messages: DashboardMessage[];
  stats: DashboardStats;
  completion: ResumeCompletionResult;
  inquiries: DashboardInquiry[];
}

export interface DashboardInquiry {
  id: string;
  visitor_name: string | null;
  visitor_email: string;
  question: string;
  created_at: string;
}

export type DashboardCoreData = Omit<DashboardData, "completion">;
