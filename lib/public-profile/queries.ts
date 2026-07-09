import { DEFAULT_SUGGESTED_QUESTIONS } from "@/lib/chat/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  PublicProfileData,
  PublicProject,
  PublicSkill,
} from "@/lib/public-profile/types";

export type PublicProfileResult =
  | { kind: "not_found" }
  | { kind: "private"; slug: string }
  | { kind: "public"; data: PublicProfileData };

function buildSuggestedQuestions(name: string, projects: PublicProject[]) {
  const questions: string[] = [...DEFAULT_SUGGESTED_QUESTIONS];

  if (projects[0]?.title) {
    questions.unshift(`${projects[0].title} 프로젝트에서 무엇을 배웠나요?`);
  }

  questions.push(`${name}님의 강점은 무엇인가요?`);

  return questions.slice(0, 4);
}

export async function getPublicProfileBySlug(
  slug: string,
): Promise<PublicProfileResult> {
  const supabase = createAdminClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, slug, name, role_title, intro, avatar_url, status, is_private")
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

  const [{ data: skills }, { data: projects }] = await Promise.all([
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
  ]);

  return {
    kind: "public",
    data: {
      profile,
      skills: (skills ?? []) as PublicSkill[],
      projects: (projects ?? []) as PublicProject[],
      suggestedQuestions: buildSuggestedQuestions(
        profile.name,
        (projects ?? []) as PublicProject[],
      ),
    },
  };
}
