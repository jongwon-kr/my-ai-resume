import { getTopUserQuestions } from "@/lib/dashboard/top-questions";
import type { DashboardMessage } from "@/lib/dashboard/types";
import {
  getExamplePublicProfileData,
  isExampleProfileSlug,
} from "@/lib/example/demo-profile";
import {
  buildSuggestedQuestions,
  buildWelcomeMessage,
} from "@/lib/public-profile/suggested-questions";
import { normalizeEnabledSections } from "@/lib/resume/enabled-sections";
import { normalizeSectionOrder } from "@/lib/resume/section-order";
import type {
  PublicActivity,
  PublicCareer,
  PublicCertification,
  PublicCoverLetter,
  PublicEducation,
  PublicProfileData,
  PublicProject,
  PublicSkill,
} from "@/lib/public-profile/types";
import { createAdminClient } from "@/lib/supabase/admin";

export type PublicProfileResult =
  | { kind: "not_found" }
  | { kind: "private"; slug: string }
  | { kind: "public"; data: PublicProfileData };

export async function getPublicProfileBySlug(
  slug: string,
): Promise<PublicProfileResult> {
  if (isExampleProfileSlug(slug)) {
    return { kind: "public", data: getExamplePublicProfileData() };
  }

  const supabase = createAdminClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "id, slug, name, role_title, intro, avatar_url, status, is_private, birth_year, phone, public_email, location, enabled_sections, section_order, show_phone, show_exact_age, suggest_top_questions_in_chat",
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
    { data: activities },
    { data: coverLetters },
    { data: ownerFaqs },
    { data: profileLinks },
    sessionsResult,
  ] = await Promise.all([
    supabase
      .from("skills")
      .select("id, name, proficiency")
      .eq("profile_id", profile.id)
      .order("sort_order"),
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
      .select("id, category, name, issuer, acquired_date, sort_order")
      .eq("profile_id", profile.id)
      .order("sort_order"),
    supabase
      .from("activities")
      .select("id, title, organization, period, description, sort_order")
      .eq("profile_id", profile.id)
      .order("sort_order"),
    supabase
      .from("cover_letters")
      .select("id, title, content, sort_order")
      .eq("profile_id", profile.id)
      .order("sort_order"),
    supabase
      .from("owner_faqs")
      .select("question, sort_order")
      .eq("profile_id", profile.id)
      .order("sort_order"),
    supabase
      .from("profile_links")
      .select("id, label, url, sort_order")
      .eq("profile_id", profile.id)
      .order("sort_order"),
    supabase
      .from("chat_sessions")
      .select("id")
      .eq("profile_id", profile.id)
      .eq("session_type", "visitor"),
  ]);

  const enabledSections = normalizeEnabledSections(
    profile.enabled_sections as string[] | null,
  );
  const sectionOrder = normalizeSectionOrder(
    profile.section_order as number[] | null,
  );

  const careerList = (careers ?? []) as PublicCareer[];
  const projectList = (projects ?? []) as PublicProject[];
  const skillList = (skills ?? []) as PublicSkill[];
  const coverLetterList = (coverLetters ?? []) as PublicCoverLetter[];

  let topVisitorQuestions: string[] = [];
  if (profile.suggest_top_questions_in_chat && sessionsResult.data?.length) {
    const sessionIds = sessionsResult.data.map((session) => session.id);
    const { data: chatMessages } = await supabase
      .from("chat_messages")
      .select("id, session_id, role, content, created_at")
      .in("session_id", sessionIds);

    if (chatMessages?.length) {
      topVisitorQuestions = getTopUserQuestions(
        chatMessages as DashboardMessage[],
      ).map(
        (item) => item.question,
      );
    }
  }

  const ownerFaqQuestions = (ownerFaqs ?? []).map((faq) => faq.question);

  const suggestedQuestions = buildSuggestedQuestions({
    name: profile.name,
    roleTitle: profile.role_title,
    projects: projectList,
    careers: careerList,
    skills: skillList,
    coverLetters: coverLetterList,
    ownerFaqQuestions,
    topVisitorQuestions,
  });

  const welcomeMessage = buildWelcomeMessage({
    name: profile.name,
  });

  return {
    kind: "public",
    data: {
      profile,
      profileLinks: profileLinks ?? [],
      skills: skillList,
      projects: projectList,
      careers: careerList,
      education: (education ?? []) as PublicEducation[],
      certifications: (certifications ?? []) as PublicCertification[],
      activities: (activities ?? []) as PublicActivity[],
      coverLetters: coverLetterList,
      enabledSections,
      sectionOrder,
      suggestedQuestions,
      welcomeMessage,
      ownerEmail: profile.public_email,
    },
  };
}
