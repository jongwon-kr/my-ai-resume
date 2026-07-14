import type { SupabaseClient } from "@supabase/supabase-js";

import { type ResumeFormValues } from "@/lib/resume/schema";
import { normalizeEnabledSections } from "@/lib/resume/enabled-sections";
import { normalizeSectionOrder } from "@/lib/resume/section-order";
import type { Database } from "@/types/database";

export async function loadResumeFormData(
  supabase: SupabaseClient<Database>,
  profileId: string,
): Promise<ResumeFormValues | null> {
  const [
    { data: profile },
    { data: skills },
    { data: projects },
    { data: careers },
    { data: education },
    { data: certifications },
    { data: activities },
    { data: coverLetters },
    { data: ownerFaqs },
    { data: profileLinks },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", profileId).single(),
    supabase
      .from("skills")
      .select("id, name, proficiency")
      .eq("profile_id", profileId)
      .order("sort_order"),
    supabase
      .from("projects")
      .select(
        "id, title, period, role, tech_stack, situation, actions, results, troubleshooting, sort_order",
      )
      .eq("profile_id", profileId)
      .order("sort_order"),
    supabase
      .from("careers")
      .select("id, company, position, period, description, sort_order")
      .eq("profile_id", profileId)
      .order("sort_order"),
    supabase
      .from("education")
      .select("id, school, major, degree, status, period, sort_order")
      .eq("profile_id", profileId)
      .order("sort_order"),
    supabase
      .from("certifications")
      .select("id, category, name, issuer, acquired_date, sort_order")
      .eq("profile_id", profileId)
      .order("sort_order"),
    supabase
      .from("activities")
      .select("id, title, organization, period, description, sort_order")
      .eq("profile_id", profileId)
      .order("sort_order"),
    supabase
      .from("cover_letters")
      .select("id, title, content, sort_order")
      .eq("profile_id", profileId)
      .order("sort_order"),
    supabase
      .from("owner_faqs")
      .select("id, question, answer, match_mode, sort_order")
      .eq("profile_id", profileId)
      .order("sort_order"),
    supabase
      .from("profile_links")
      .select("id, label, url, sort_order")
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
    birth_year: profile.birth_year ?? undefined,
    phone: profile.phone ?? "",
    public_email: profile.public_email ?? "",
    location: profile.location ?? "",
    profile_links: (profileLinks ?? []).map((link) => ({
      id: link.id,
      label: link.label,
      url: link.url,
    })),
    show_phone: profile.show_phone ?? false,
    show_exact_age: profile.show_exact_age ?? false,
    suggest_top_questions_in_chat:
      profile.suggest_top_questions_in_chat ?? false,
    enabled_sections: normalizeEnabledSections(
      profile.enabled_sections as string[] | null,
    ),
    section_order: normalizeSectionOrder(
      profile.section_order as number[] | null,
    ),
    careers: (careers ?? []).map((career) => ({
      id: career.id,
      company: career.company,
      position: career.position ?? "",
      period: career.period ?? "",
      description: career.description ?? "",
    })),
    education: (education ?? []).map((item) => ({
      id: item.id,
      school: item.school,
      major: item.major ?? "",
      degree: item.degree ?? "",
      status: item.status ?? "",
      period: item.period ?? "",
    })),
    certifications: (certifications ?? []).map((cert) => ({
      id: cert.id,
      category:
        cert.category === "어학" || cert.category === "수상"
          ? cert.category
          : "자격",
      name: cert.name,
      issuer: cert.issuer ?? "",
      acquired_date: cert.acquired_date ?? "",
    })),
    activities: (activities ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      organization: item.organization ?? "",
      period: item.period ?? "",
      description: item.description ?? "",
    })),
    cover_letters: (coverLetters ?? []).map((letter) => ({
      id: letter.id,
      title: letter.title,
      content: letter.content ?? "",
    })),
    owner_faqs: (ownerFaqs ?? []).map((faq) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      match_mode:
        faq.match_mode === "exact" ? ("exact" as const) : ("semantic" as const),
    })),
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
      birth_year: values.birth_year ?? null,
      phone: values.phone?.trim() || null,
      public_email: values.public_email?.trim() || null,
      location: values.location?.trim() || null,
      show_phone: values.show_phone,
      show_exact_age: values.show_exact_age,
      suggest_top_questions_in_chat: values.suggest_top_questions_in_chat,
      enabled_sections: values.enabled_sections,
      section_order: normalizeSectionOrder(values.section_order),
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
    .map((skill, index) => ({
      profile_id: profileId,
      name: skill.name.trim(),
      proficiency: skill.proficiency?.trim() || null,
      sort_order: index,
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

  const { error: deleteCareersError } = await supabase
    .from("careers")
    .delete()
    .eq("profile_id", profileId);

  if (deleteCareersError) {
    throw deleteCareersError;
  }

  const careerRows = (values.careers ?? [])
    .filter((career) => career.company.trim())
    .map((career, index) => ({
      profile_id: profileId,
      company: career.company.trim(),
      position: career.position?.trim() || null,
      period: career.period?.trim() || null,
      description: career.description?.trim() || null,
      sort_order: index,
    }));

  if (careerRows.length > 0) {
    const { error: careersError } = await supabase
      .from("careers")
      .insert(careerRows);

    if (careersError) {
      throw careersError;
    }
  }

  const { error: deleteEducationError } = await supabase
    .from("education")
    .delete()
    .eq("profile_id", profileId);

  if (deleteEducationError) {
    throw deleteEducationError;
  }

  const educationRows = (values.education ?? [])
    .filter((item) => item.school.trim())
    .map((item, index) => ({
      profile_id: profileId,
      school: item.school.trim(),
      major: item.major?.trim() || null,
      degree: item.degree?.trim() || null,
      status: item.status?.trim() || null,
      period: item.period?.trim() || null,
      sort_order: index,
    }));

  if (educationRows.length > 0) {
    const { error: educationError } = await supabase
      .from("education")
      .insert(educationRows);

    if (educationError) {
      throw educationError;
    }
  }

  const { error: deleteCertificationsError } = await supabase
    .from("certifications")
    .delete()
    .eq("profile_id", profileId);

  if (deleteCertificationsError) {
    throw deleteCertificationsError;
  }

  const certificationRows = (values.certifications ?? [])
    .filter((cert) => cert.name.trim())
    .map((cert, index) => ({
      profile_id: profileId,
      category: cert.category ?? "자격",
      name: cert.name.trim(),
      issuer: cert.issuer?.trim() || null,
      acquired_date: cert.acquired_date?.trim() || null,
      sort_order: index,
    }));

  if (certificationRows.length > 0) {
    const { error: certificationsError } = await supabase
      .from("certifications")
      .insert(certificationRows);

    if (certificationsError) {
      throw certificationsError;
    }
  }

  const { error: deleteActivitiesError } = await supabase
    .from("activities")
    .delete()
    .eq("profile_id", profileId);

  if (deleteActivitiesError) {
    throw deleteActivitiesError;
  }

  const activityRows = (values.activities ?? [])
    .filter((item) => item.title.trim())
    .map((item, index) => ({
      profile_id: profileId,
      title: item.title.trim(),
      organization: item.organization?.trim() || null,
      period: item.period?.trim() || null,
      description: item.description?.trim() || null,
      sort_order: index,
    }));

  if (activityRows.length > 0) {
    const { error: activitiesError } = await supabase
      .from("activities")
      .insert(activityRows);

    if (activitiesError) {
      throw activitiesError;
    }
  }

  const { error: deleteCoverLettersError } = await supabase
    .from("cover_letters")
    .delete()
    .eq("profile_id", profileId);

  if (deleteCoverLettersError) {
    throw deleteCoverLettersError;
  }

  const coverLetterRows = (values.cover_letters ?? [])
    .filter((letter) => letter.title.trim())
    .map((letter, index) => ({
      profile_id: profileId,
      title: letter.title.trim(),
      content: letter.content?.trim() || null,
      sort_order: index,
    }));

  if (coverLetterRows.length > 0) {
    const { error: coverLettersError } = await supabase
      .from("cover_letters")
      .insert(coverLetterRows);

    if (coverLettersError) {
      throw coverLettersError;
    }
  }

  const { error: deleteFaqsError } = await supabase
    .from("owner_faqs")
    .delete()
    .eq("profile_id", profileId);

  if (deleteFaqsError) {
    throw deleteFaqsError;
  }

  const faqRows = (values.owner_faqs ?? [])
    .filter((faq) => faq.question.trim() && faq.answer.trim())
    .map((faq, index) => ({
      profile_id: profileId,
      question: faq.question.trim(),
      answer: faq.answer.trim(),
      match_mode: faq.match_mode === "exact" ? "exact" : "semantic",
      sort_order: index,
    }));

  if (faqRows.length > 0) {
    const { error: faqsError } = await supabase
      .from("owner_faqs")
      .insert(faqRows);

    if (faqsError) {
      throw faqsError;
    }
  }

  const { error: deleteProfileLinksError } = await supabase
    .from("profile_links")
    .delete()
    .eq("profile_id", profileId);

  if (deleteProfileLinksError) {
    throw deleteProfileLinksError;
  }

  const profileLinkRows = (values.profile_links ?? [])
    .filter((link) => link.label.trim() && link.url?.trim())
    .map((link, index) => ({
      profile_id: profileId,
      label: link.label.trim(),
      url: link.url!.trim(),
      sort_order: index,
    }));

  if (profileLinkRows.length > 0) {
    const { error: profileLinksError } = await supabase
      .from("profile_links")
      .insert(profileLinkRows);

    if (profileLinksError) {
      throw profileLinksError;
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
