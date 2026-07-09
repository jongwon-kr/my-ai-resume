import type { OptionalSectionKey } from "@/lib/resume/schema";
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
  | "birth_year"
  | "phone"
  | "public_email"
  | "location"
  | "github_url"
  | "linkedin_url"
  | "blog_url"
>;

export type PublicSkill = Pick<Tables<"skills">, "id" | "name" | "proficiency">;

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

export type PublicCareer = Pick<
  Tables<"careers">,
  "id" | "company" | "position" | "period" | "description" | "sort_order"
>;

export type PublicEducation = Pick<
  Tables<"education">,
  "id" | "school" | "major" | "degree" | "status" | "period" | "sort_order"
>;

export type PublicCertification = Pick<
  Tables<"certifications">,
  "id" | "category" | "name" | "issuer" | "acquired_date" | "sort_order"
>;

export type PublicActivity = Pick<
  Tables<"activities">,
  "id" | "title" | "organization" | "period" | "description" | "sort_order"
>;

export type PublicCoverLetter = Pick<
  Tables<"cover_letters">,
  "id" | "title" | "content" | "sort_order"
>;

export interface PublicProfileData {
  profile: PublicProfile;
  skills: PublicSkill[];
  projects: PublicProject[];
  careers: PublicCareer[];
  education: PublicEducation[];
  certifications: PublicCertification[];
  activities: PublicActivity[];
  coverLetters: PublicCoverLetter[];
  enabledSections: OptionalSectionKey[];
  sectionOrder: number[];
  suggestedQuestions: string[];
}
