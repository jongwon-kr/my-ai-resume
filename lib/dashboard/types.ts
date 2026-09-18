import type { CoverageGap } from "@/lib/chat/question-coverage";
import type { ChatMessageRole, ProfileStatus } from "@/types/database";
import type { ResumeCompletionResult } from "@/lib/resume/completion";
import type { TopQuestion } from "@/lib/dashboard/top-questions";

export interface OwnerProfile {
  id: string;
  slug: string;
  name: string;
  label: string | null;
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
  /** Null for turns recorded before answer tracking existed. */
  answer_status?: string | null;
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
  /** Questions the clone refused — the owner's FAQ backlog. */
  unanswered_questions: TopQuestion[];
}

export interface DashboardData {
  profile: OwnerProfile;
  sessions: DashboardSession[];
  messages: DashboardMessage[];
  stats: DashboardStats;
  completion: ResumeCompletionResult;
  /** Question types the chatbot cannot answer yet, for owner guidance. */
  coverageGaps: CoverageGap[];
  inquiries: DashboardInquiry[];
}

export interface DashboardInquiry {
  id: string;
  visitor_name: string | null;
  visitor_email: string;
  question: string;
  created_at: string;
}

export type DashboardCoreData = Omit<
  DashboardData,
  "completion" | "coverageGaps"
>;
