import type { SupabaseClient } from "@supabase/supabase-js";

import type { ResumeFormValues } from "@/lib/resume/schema";
import type { Database } from "@/types/database";

export async function loadResumeFormData(
  supabase: SupabaseClient<Database>,
  profileId: string,
): Promise<ResumeFormValues | null> {
  const [{ data: profile }, { data: skills }, { data: projects }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", profileId).single(),
      supabase
        .from("skills")
        .select("id, name, proficiency")
        .eq("profile_id", profileId)
        .order("name"),
      supabase
        .from("projects")
        .select(
          "id, title, period, role, tech_stack, situation, actions, results, troubleshooting, sort_order",
        )
        .eq("profile_id", profileId)
        .order("sort_order"),
    ]);

  if (!profile) {
    return null;
  }

  return {
    name: profile.name ?? "",
    role_title: profile.role_title ?? "",
    intro: profile.intro ?? "",
    avatar_url: profile.avatar_url ?? "",
    skills:
      skills && skills.length > 0
        ? skills.map((skill) => ({
            id: skill.id,
            name: skill.name,
            proficiency: skill.proficiency ?? "",
          }))
        : [{ name: "", proficiency: "" }],
    projects:
      projects && projects.length > 0
        ? projects.map((project) => ({
            id: project.id,
            title: project.title,
            period: project.period ?? "",
            role: project.role ?? "",
            tech_stack: project.tech_stack ?? "",
            situation: project.situation ?? "",
            actions: project.actions ?? "",
            results: project.results ?? "",
            troubleshooting: project.troubleshooting ?? "",
          }))
        : [
            {
              title: "",
              period: "",
              role: "",
              tech_stack: "",
              situation: "",
              actions: "",
              results: "",
              troubleshooting: "",
            },
          ],
  };
}

export async function saveResumeDraft(
  supabase: SupabaseClient<Database>,
  profileId: string,
  values: ResumeFormValues,
) {
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      name: values.name,
      role_title: values.role_title,
      intro: values.intro,
      avatar_url: values.avatar_url || null,
      status: "draft",
    })
    .eq("id", profileId);

  if (profileError) {
    throw profileError;
  }

  const { error: deleteSkillsError } = await supabase
    .from("skills")
    .delete()
    .eq("profile_id", profileId);

  if (deleteSkillsError) {
    throw deleteSkillsError;
  }

  const skillRows = values.skills
    .filter((skill) => skill.name.trim())
    .map((skill) => ({
      profile_id: profileId,
      name: skill.name.trim(),
      proficiency: skill.proficiency?.trim() || null,
    }));

  if (skillRows.length > 0) {
    const { error: skillsError } = await supabase
      .from("skills")
      .insert(skillRows);

    if (skillsError) {
      throw skillsError;
    }
  }

  const { error: deleteProjectsError } = await supabase
    .from("projects")
    .delete()
    .eq("profile_id", profileId);

  if (deleteProjectsError) {
    throw deleteProjectsError;
  }

  const projectRows = values.projects
    .filter((project) => project.title.trim())
    .map((project, index) => ({
      profile_id: profileId,
      title: project.title.trim(),
      period: project.period.trim() || null,
      role: project.role.trim() || null,
      tech_stack: project.tech_stack.trim() || null,
      situation: project.situation.trim() || null,
      actions: project.actions.trim() || null,
      results: project.results.trim() || null,
      troubleshooting: project.troubleshooting.trim() || null,
      sort_order: index,
    }));

  if (projectRows.length > 0) {
    const { error: projectsError } = await supabase
      .from("projects")
      .insert(projectRows);

    if (projectsError) {
      throw projectsError;
    }
  }
}

export async function publishResumeProfile(
  supabase: SupabaseClient<Database>,
  profileId: string,
) {
  const { error } = await supabase
    .from("profiles")
    .update({ status: "published" })
    .eq("id", profileId);

  if (error) {
    throw error;
  }
}

export async function uploadAvatar(
  supabase: SupabaseClient<Database>,
  profileId: string,
  file: File,
) {
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${profileId}/avatar.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  return `${publicUrl}?t=${Date.now()}`;
}
