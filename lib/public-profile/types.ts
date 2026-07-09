import type { Tables } from "@/types/database";

export type PublicProfile = Pick<
  Tables<"profiles">,
  | "id"
  | "slug"
  | "name"
  | "role_title"
  | "intro"
  | "avatar_url"
  | "status"
  | "is_private"
>;

export type PublicSkill = Pick<
  Tables<"skills">,
  "id" | "name" | "proficiency"
>;

export type PublicProject = Pick<
  Tables<"projects">,
  | "id"
  | "title"
  | "period"
  | "role"
  | "tech_stack"
  | "situation"
  | "actions"
  | "results"
  | "troubleshooting"
  | "sort_order"
>;

export interface PublicProfileData {
  profile: PublicProfile;
  skills: PublicSkill[];
  projects: PublicProject[];
  suggestedQuestions: string[];
}
