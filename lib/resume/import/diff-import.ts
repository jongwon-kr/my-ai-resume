import type { ResumeFormValues } from "@/lib/resume/schema";

export interface ImportPreviewItem {
  label: string;
  current: string;
  imported: string;
  needsReview: boolean;
}

const BASIC_FIELDS: Array<{
  key: keyof ResumeFormValues;
  label: string;
}> = [
  { key: "name", label: "이름" },
  { key: "role_title", label: "직무" },
  { key: "intro", label: "한줄소개" },
  { key: "phone", label: "연락처" },
  { key: "public_email", label: "공개 이메일" },
  { key: "location", label: "지역" },
  { key: "github_url", label: "GitHub" },
  { key: "linkedin_url", label: "LinkedIn" },
  { key: "blog_url", label: "블로그" },
];

function displayValue(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return "(비어 있음)";
  }

  return String(value);
}

function countFilled(items: Array<{ [key: string]: string | undefined }>, key: string) {
  return items.filter((item) => item[key]?.trim()).length;
}

export function buildImportPreviewDiff(
  current: ResumeFormValues,
  imported: ResumeFormValues,
  needsReview: string[],
): ImportPreviewItem[] {
  const reviewSet = new Set(needsReview);
  const items: ImportPreviewItem[] = [];

  for (const field of BASIC_FIELDS) {
    const currentValue = displayValue(current[field.key]);
    const importedValue = displayValue(imported[field.key]);

    if (currentValue === importedValue && importedValue === "(비어 있음)") {
      continue;
    }

    items.push({
      label: field.label,
      current: currentValue,
      imported: importedValue,
      needsReview: reviewSet.has(String(field.key)),
    });
  }

  if (imported.birth_year) {
    items.push({
      label: "출생연도",
      current: displayValue(current.birth_year),
      imported: displayValue(imported.birth_year),
      needsReview: reviewSet.has("birth_year"),
    });
  }

  const sectionSummaries = [
    {
      label: "경력",
      currentCount: current.careers?.length ?? 0,
      importedCount: countFilled(imported.careers ?? [], "company"),
      path: "careers",
    },
    {
      label: "학력",
      currentCount: current.education?.length ?? 0,
      importedCount: countFilled(imported.education ?? [], "school"),
      path: "education",
    },
    {
      label: "자격증",
      currentCount: current.certifications?.length ?? 0,
      importedCount: countFilled(imported.certifications ?? [], "name"),
      path: "certifications",
    },
    {
      label: "기술 스택",
      currentCount: countFilled(current.skills, "name"),
      importedCount: countFilled(imported.skills, "name"),
      path: "skills",
    },
    {
      label: "프로젝트",
      currentCount: countFilled(current.projects, "title"),
      importedCount: countFilled(imported.projects, "title"),
      path: "projects",
    },
    {
      label: "자기소개서",
      currentCount: current.cover_letters?.length ?? 0,
      importedCount: countFilled(imported.cover_letters ?? [], "title"),
      path: "cover_letters",
    },
  ];

  for (const section of sectionSummaries) {
    if (section.importedCount === 0 && section.currentCount === 0) {
      continue;
    }

    items.push({
      label: section.label,
      current: `${section.currentCount}건`,
      imported: `${section.importedCount}건`,
      needsReview: reviewSet.has(section.path),
    });
  }

  return items;
}

export function hasImportChanges(items: ImportPreviewItem[]) {
  return items.some((item) => item.current !== item.imported);
}
