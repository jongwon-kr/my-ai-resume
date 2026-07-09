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
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("name, role_title, intro")
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
  ]);

  if (profileError || !profile) {
    throw new PromptGenerateError("프로필을 찾을 수 없습니다.", 404);
  }

  if (skillsError) {
    throw new PromptGenerateError(skillsError.message, 500);
  }

  if (projectsError) {
    throw new PromptGenerateError(projectsError.message, 500);
  }

  return {
    profile: {
      name: profile.name,
      role_title: profile.role_title,
      intro: profile.intro,
    },
    skills: skills ?? [],
    projects: projects ?? [],
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
