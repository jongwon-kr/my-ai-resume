import { DEFAULT_SUGGESTED_QUESTIONS } from "@/lib/chat/constants";
import {
  OPTIONAL_SECTION_KEYS,
  type OptionalSectionKey,
} from "@/lib/resume/schema";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  PublicCareer,
  PublicCertification,
  PublicCoverLetter,
  PublicEducation,
  PublicProfileData,
  PublicProject,
  PublicSkill,
} from "@/lib/public-profile/types";

export type PublicProfileResult =
  | { kind: "not_found" }
  | { kind: "private"; slug: string }
  | { kind: "public"; data: PublicProfileData };

function buildSuggestedQuestions(
  name: string,
  projects: PublicProject[],
  careers: PublicCareer[],
) {
  const questions: string[] = [];

  if (projects[0]?.title) {
    questions.push(
      `${projects[0].title} 프로젝트에서 맡은 역할과 성과는 무엇인가요?`,
    );
  }

  if (careers[0]?.company) {
    questions.push(`${careers[0].company}에서는 어떤 일을 하셨나요?`);
  }

  questions.push(...DEFAULT_SUGGESTED_QUESTIONS);
  questions.push(`${name}님의 강점은 무엇인가요?`);

  return Array.from(new Set(questions)).slice(0, 4);
}

export async function getPublicProfileBySlug(
  slug: string,
): Promise<PublicProfileResult> {
  const supabase = createAdminClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "id, slug, name, role_title, intro, avatar_url, status, is_private, birth_year, phone, public_email, location, github_url, linkedin_url, blog_url, enabled_sections",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !profile) {
    return { kind: "not_found" };
  }

  if (profile.is_private) {
    return { kind: "private", slug: profile.slug };
  }

  if (profile.status !== "published") {
    return { kind: "not_found" };
  }

  const [
    { data: skills },
    { data: projects },
    { data: careers },
    { data: education },
    { data: certifications },
    { data: coverLetters },
  ] = await Promise.all([
    supabase
      .from("skills")
      .select("id, name, proficiency")
      .eq("profile_id", profile.id)
      .order("name"),
    supabase
      .from("projects")
      .select(
        "id, title, period, role, tech_stack, situation, actions, results, troubleshooting, sort_order",
      )
      .eq("profile_id", profile.id)
      .order("sort_order"),
    supabase
      .from("careers")
      .select("id, company, position, period, description, sort_order")
      .eq("profile_id", profile.id)
      .order("sort_order"),
    supabase
      .from("education")
      .select("id, school, major, degree, status, period, sort_order")
      .eq("profile_id", profile.id)
      .order("sort_order"),
    supabase
      .from("certifications")
      .select("id, name, issuer, acquired_date, sort_order")
      .eq("profile_id", profile.id)
      .order("sort_order"),
    supabase
      .from("cover_letters")
      .select("id, title, content, sort_order")
      .eq("profile_id", profile.id)
      .order("sort_order"),
  ]);

  const enabledSections = (
    (profile.enabled_sections as OptionalSectionKey[] | null) ?? [
      ...OPTIONAL_SECTION_KEYS,
    ]
  ).filter((section): section is OptionalSectionKey =>
    (OPTIONAL_SECTION_KEYS as readonly string[]).includes(section),
  );

  const careerList = (careers ?? []) as PublicCareer[];
  const projectList = (projects ?? []) as PublicProject[];

  return {
    kind: "public",
    data: {
      profile,
      skills: (skills ?? []) as PublicSkill[],
      projects: projectList,
      careers: careerList,
      education: (education ?? []) as PublicEducation[],
      certifications: (certifications ?? []) as PublicCertification[],
      coverLetters: (coverLetters ?? []) as PublicCoverLetter[],
      enabledSections,
      suggestedQuestions: buildSuggestedQuestions(
        profile.name,
        projectList,
        careerList,
      ),
    },
  };
}
