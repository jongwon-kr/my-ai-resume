import type { SupabaseClient } from "@supabase/supabase-js";

import {
  buildSystemPrompt,
  type SystemPromptInput,
} from "@/lib/prompt/build-system-prompt";
import type { Database } from "@/types/database";

export class PromptGenerateError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "PromptGenerateError";
  }
}

async function fetchPromptInput(
  supabase: SupabaseClient<Database>,
  profileId: string,
): Promise<SystemPromptInput> {
  const [
    { data: profile, error: profileError },
    { data: skills, error: skillsError },
    { data: projects, error: projectsError },
    { data: careers, error: careersError },
    { data: education, error: educationError },
    { data: certifications, error: certificationsError },
    { data: coverLetters, error: coverLettersError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "name, role_title, intro, birth_year, location, public_email, phone, github_url, linkedin_url, blog_url, enabled_sections",
      )
      .eq("id", profileId)
      .single(),
    supabase
      .from("skills")
      .select("name, proficiency")
      .eq("profile_id", profileId)
      .order("name"),
    supabase
      .from("projects")
      .select(
        "title, period, role, tech_stack, situation, actions, results, troubleshooting, sort_order",
      )
      .eq("profile_id", profileId)
      .order("sort_order"),
    supabase
      .from("careers")
      .select("company, position, period, description, sort_order")
      .eq("profile_id", profileId)
      .order("sort_order"),
    supabase
      .from("education")
      .select("school, major, degree, status, period, sort_order")
      .eq("profile_id", profileId)
      .order("sort_order"),
    supabase
      .from("certifications")
      .select("name, issuer, acquired_date, sort_order")
      .eq("profile_id", profileId)
      .order("sort_order"),
    supabase
      .from("cover_letters")
      .select("title, content, sort_order")
      .eq("profile_id", profileId)
      .order("sort_order"),
  ]);

  if (profileError || !profile) {
    throw new PromptGenerateError("프로필을 찾을 수 없습니다.", 404);
  }

  const firstError =
    skillsError ??
    projectsError ??
    careersError ??
    educationError ??
    certificationsError ??
    coverLettersError;

  if (firstError) {
    throw new PromptGenerateError(firstError.message, 500);
  }

  return {
    profile: {
      name: profile.name,
      role_title: profile.role_title,
      intro: profile.intro,
      birth_year: profile.birth_year,
      location: profile.location,
      public_email: profile.public_email,
      phone: profile.phone,
      github_url: profile.github_url,
      linkedin_url: profile.linkedin_url,
      blog_url: profile.blog_url,
    },
    skills: skills ?? [],
    projects: projects ?? [],
    careers: careers ?? [],
    education: education ?? [],
    certifications: certifications ?? [],
    coverLetters: coverLetters ?? [],
    enabledSections: (profile.enabled_sections as string[] | null) ?? [],
  };
}

async function getNextPromptVersion(
  supabase: SupabaseClient<Database>,
  profileId: string,
) {
  const { data, error } = await supabase
    .from("system_prompts")
    .select("version")
    .eq("profile_id", profileId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new PromptGenerateError(error.message, 500);
  }

  return (data?.version ?? 0) + 1;
}

export async function generateAndStoreSystemPrompt(
  supabase: SupabaseClient<Database>,
  profileId: string,
) {
  const input = await fetchPromptInput(supabase, profileId);
  const content = buildSystemPrompt(input);
  const version = await getNextPromptVersion(supabase, profileId);

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[prompt/generate] profile_id=${profileId} version=${version}\n`,
      content,
    );
  }

  const { error: insertError } = await supabase.from("system_prompts").insert({
    profile_id: profileId,
    content,
    version,
  });

  if (insertError) {
    throw new PromptGenerateError(insertError.message, 500);
  }

  const { error: publishError } = await supabase
    .from("profiles")
    .update({ status: "published" })
    .eq("id", profileId);

  if (publishError) {
    throw new PromptGenerateError(publishError.message, 500);
  }

  return { version };
}
