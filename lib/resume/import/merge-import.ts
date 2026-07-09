import type { ResumeFormValues } from "@/lib/resume/schema";

function pickImportedString(current: string, imported: string) {
  return imported.trim() ? imported : current;
}

function pickImportedArray<T>(current: T[], imported: T[]) {
  return imported.length > 0 ? imported : current;
}

/** Applies imported resume data onto the current form (avatar preserved). */
export function mergeResumeImport(
  current: ResumeFormValues,
  imported: ResumeFormValues,
): ResumeFormValues {
  return {
    ...current,
    name: pickImportedString(current.name, imported.name),
    role_title: pickImportedString(current.role_title, imported.role_title),
    intro: pickImportedString(current.intro, imported.intro),
    avatar_url: current.avatar_url,
    birth_year: imported.birth_year ?? current.birth_year,
    phone: pickImportedString(current.phone ?? "", imported.phone ?? ""),
    public_email: pickImportedString(
      current.public_email ?? "",
      imported.public_email ?? "",
    ),
    location: pickImportedString(current.location ?? "", imported.location ?? ""),
    github_url: pickImportedString(
      current.github_url ?? "",
      imported.github_url ?? "",
    ),
    linkedin_url: pickImportedString(
      current.linkedin_url ?? "",
      imported.linkedin_url ?? "",
    ),
    blog_url: pickImportedString(current.blog_url ?? "", imported.blog_url ?? ""),
    careers: pickImportedArray(current.careers ?? [], imported.careers ?? []),
    education: pickImportedArray(
      current.education ?? [],
      imported.education ?? [],
    ),
    certifications: pickImportedArray(
      current.certifications ?? [],
      imported.certifications ?? [],
    ),
    skills: pickImportedArray(current.skills, imported.skills),
    projects: pickImportedArray(current.projects, imported.projects),
    cover_letters: pickImportedArray(
      current.cover_letters ?? [],
      imported.cover_letters ?? [],
    ),
    owner_faqs: pickImportedArray(
      current.owner_faqs ?? [],
      imported.owner_faqs ?? [],
    ),
    enabled_sections:
      imported.enabled_sections.length > 0
        ? imported.enabled_sections
        : current.enabled_sections,
  };
}
