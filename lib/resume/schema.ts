import { z } from "zod";

export const PROFICIENCY_OPTIONS = [
  "입문",
  "초급",
  "중급",
  "고급",
  "전문가",
] as const;

export const POPULAR_SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "Java",
  "Spring",
  "Kotlin",
  "Go",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Docker",
  "Kubernetes",
  "AWS",
  "GCP",
  "Azure",
  "GraphQL",
  "REST API",
  "Tailwind CSS",
  "Figma",
  "Git",
  "CI/CD",
  "Supabase",
  "Vue.js",
  "React Native",
  "Flutter",
  "FastAPI",
] as const;

export const RESUME_BUILDER_STEPS = [
  { id: 1, label: "기본 정보" },
  { id: 2, label: "기술 스택" },
  { id: 3, label: "프로젝트" },
  { id: 4, label: "미리보기" },
] as const;

export const AUTOSAVE_INTERVAL_MS = 30_000;

export const skillItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "기술명을 입력하세요.").max(50),
  proficiency: z.string().optional(),
});

export const projectItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "프로젝트명을 입력하세요.").max(100),
  period: z.string().trim().min(1, "기간을 입력하세요.").max(50),
  role: z.string().trim().min(1, "역할을 입력하세요.").max(100),
  tech_stack: z.string().trim().min(1, "사용 기술을 입력하세요.").max(200),
  situation: z.string().trim().min(1, "상황/과제를 입력하세요.").max(1000),
  actions: z.string().trim().min(1, "수행 내용을 입력하세요.").max(1000),
  results: z.string().trim().min(1, "성과를 입력하세요.").max(1000),
  troubleshooting: z
    .string()
    .trim()
    .min(1, "트러블슈팅을 입력하세요.")
    .max(1000),
});

export const basicInfoStepSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력하세요.").max(50),
  role_title: z.string().trim().min(1, "직무를 입력하세요.").max(100),
  intro: z.string().trim().min(1, "한줄소개를 입력하세요.").max(200),
  avatar_url: z.string().optional(),
});

export const skillsStepSchema = z.object({
  skills: z
    .array(skillItemSchema)
    .min(1, "최소 1개의 기술을 추가하세요.")
    .max(20),
});

export const projectsStepSchema = z.object({
  projects: z
    .array(projectItemSchema)
    .min(1, "최소 1개의 프로젝트를 추가하세요.")
    .max(3),
});

export const resumeFormSchema = basicInfoStepSchema
  .merge(skillsStepSchema)
  .merge(projectsStepSchema);

export type SkillFormItem = z.infer<typeof skillItemSchema>;
export type ProjectFormItem = z.infer<typeof projectItemSchema>;
export type ResumeFormValues = z.infer<typeof resumeFormSchema>;

export const defaultProjectItem = (): ProjectFormItem => ({
  title: "",
  period: "",
  role: "",
  tech_stack: "",
  situation: "",
  actions: "",
  results: "",
  troubleshooting: "",
});

export const defaultResumeFormValues: ResumeFormValues = {
  name: "",
  role_title: "",
  intro: "",
  avatar_url: "",
  skills: [{ name: "", proficiency: "" }],
  projects: [defaultProjectItem()],
};

export const stepSchemas = [
  basicInfoStepSchema,
  skillsStepSchema,
  projectsStepSchema,
  resumeFormSchema,
] as const;

export function getResumeProgressPercent(step: number) {
  return Math.round((step / RESUME_BUILDER_STEPS.length) * 100);
}
