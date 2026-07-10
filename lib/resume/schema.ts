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

export const CERTIFICATION_CATEGORIES = ["자격", "어학", "수상"] as const;

export const OPTIONAL_SECTION_KEYS = [
  "careers",
  "education",
  "certifications",
  "activities",
  "cover_letters",
  "owner_faqs",
] as const;

export type OptionalSectionKey = (typeof OPTIONAL_SECTION_KEYS)[number];

export const RESUME_BUILDER_STEPS = [
  { id: 1, label: "기본 정보" },
  { id: 2, label: "경력", optionalKey: "careers" },
  { id: 3, label: "학력", optionalKey: "education" },
  { id: 4, label: "자격·어학·수상", optionalKey: "certifications" },
  { id: 5, label: "경험/활동/교육", optionalKey: "activities" },
  { id: 6, label: "기술 스택" },
  { id: 7, label: "프로젝트" },
  { id: 8, label: "자기소개서", optionalKey: "cover_letters" },
  { id: 9, label: "예상 질문 답변", optionalKey: "owner_faqs" },
] as const;

export const DEFAULT_SECTION_ORDER = RESUME_BUILDER_STEPS.map(
  (step) => step.id,
);

export const OPTIONAL_SECTIONS = [
  { key: "careers", label: "경력", step: 2 },
  { key: "education", label: "학력", step: 3 },
  { key: "certifications", label: "자격·어학·수상", step: 4 },
  { key: "activities", label: "경험/활동/교육", step: 5 },
  { key: "cover_letters", label: "자기소개서", step: 8 },
  { key: "owner_faqs", label: "예상 질문 답변", step: 9 },
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

export const careerItemSchema = z.object({
  id: z.string().optional(),
  company: z.string().trim().min(1, "회사명을 입력하세요.").max(100),
  position: z.string().optional(),
  period: z.string().optional(),
  description: z.string().optional(),
});

export const educationItemSchema = z.object({
  id: z.string().optional(),
  school: z.string().trim().min(1, "학교명을 입력하세요.").max(100),
  major: z.string().optional(),
  degree: z.string().optional(),
  status: z.string().optional(),
  period: z.string().optional(),
});

export const certificationItemSchema = z.object({
  id: z.string().optional(),
  category: z.enum(CERTIFICATION_CATEGORIES),
  name: z.string().trim().min(1, "항목명을 입력하세요.").max(100),
  issuer: z.string().optional(),
  acquired_date: z.string().optional(),
});

export const activityItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "활동명을 입력하세요.").max(100),
  organization: z.string().optional(),
  period: z.string().optional(),
  description: z.string().optional(),
});

export const coverLetterItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "제목을 입력하세요.").max(100),
  content: z.string().optional(),
});

export const faqItemSchema = z.object({
  id: z.string().optional(),
  question: z.string().trim().min(1, "예상 질문을 입력하세요.").max(200),
  answer: z.string().trim().min(1, "답변을 입력하세요.").max(2000),
  match_mode: z.enum(["exact", "semantic"]).optional(),
});

const optionalEmail = z
  .string()
  .trim()
  .max(120)
  .email("올바른 이메일 형식이 아닙니다.")
  .optional()
  .or(z.literal(""));

const optionalUrl = z
  .string()
  .trim()
  .max(200)
  .url("올바른 URL 형식이 아닙니다.")
  .optional()
  .or(z.literal(""));

const optionalBirthYear = z
  .number()
  .int()
  .min(1900, "1900년 이후로 입력하세요.")
  .max(new Date().getFullYear(), "올바른 연도를 입력하세요.")
  .optional();

export const profileLinkItemSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().max(50),
  url: optionalUrl,
});

export const basicInfoStepSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력하세요.").max(50),
  role_title: z.string().trim().min(1, "직무를 입력하세요.").max(100),
  intro: z.string().trim().min(1, "한줄소개를 입력하세요.").max(200),
  avatar_url: z.string().optional(),
  birth_year: optionalBirthYear,
  phone: z.string().trim().max(30).optional(),
  public_email: optionalEmail,
  location: z.string().trim().max(100).optional(),
  profile_links: z.array(profileLinkItemSchema).max(10).optional(),
  show_phone: z.boolean(),
  show_exact_age: z.boolean(),
  suggest_top_questions_in_chat: z.boolean(),
});

export const careersStepSchema = z.object({
  careers: z.array(careerItemSchema).max(10).optional(),
});

export const educationOnlyStepSchema = z.object({
  education: z.array(educationItemSchema).max(10).optional(),
});

export const certificationsStepSchema = z.object({
  certifications: z.array(certificationItemSchema).max(20).optional(),
});

export const activitiesStepSchema = z.object({
  activities: z.array(activityItemSchema).max(20).optional(),
});

export const coverLetterStepSchema = z.object({
  cover_letters: z.array(coverLetterItemSchema).max(10).optional(),
});

export const faqsStepSchema = z.object({
  owner_faqs: z.array(faqItemSchema).max(20).optional(),
});

export const enabledSectionsSchema = z.object({
  enabled_sections: z.array(z.enum(OPTIONAL_SECTION_KEYS)),
});

export const sectionOrderSchema = z.object({
  section_order: z.array(z.number().int()).min(1),
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
  .merge(careersStepSchema)
  .merge(educationOnlyStepSchema)
  .merge(certificationsStepSchema)
  .merge(activitiesStepSchema)
  .merge(skillsStepSchema)
  .merge(projectsStepSchema)
  .merge(coverLetterStepSchema)
  .merge(faqsStepSchema)
  .merge(enabledSectionsSchema)
  .merge(sectionOrderSchema);

export type SkillFormItem = z.infer<typeof skillItemSchema>;
export type ProjectFormItem = z.infer<typeof projectItemSchema>;
export type CareerFormItem = z.infer<typeof careerItemSchema>;
export type EducationFormItem = z.infer<typeof educationItemSchema>;
export type CertificationFormItem = z.infer<typeof certificationItemSchema>;
export type ActivityFormItem = z.infer<typeof activityItemSchema>;
export type CoverLetterFormItem = z.infer<typeof coverLetterItemSchema>;
export type FaqFormItem = z.infer<typeof faqItemSchema>;
export type ProfileLinkFormItem = z.infer<typeof profileLinkItemSchema>;
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

export const defaultCareerItem = (): CareerFormItem => ({
  company: "",
  position: "",
  period: "",
  description: "",
});

export const defaultEducationItem = (): EducationFormItem => ({
  school: "",
  major: "",
  degree: "",
  status: "",
  period: "",
});

export const defaultCertificationItem = (): CertificationFormItem => ({
  category: "자격",
  name: "",
  issuer: "",
  acquired_date: "",
});

export const defaultActivityItem = (): ActivityFormItem => ({
  title: "",
  organization: "",
  period: "",
  description: "",
});

export const defaultCoverLetterItem = (): CoverLetterFormItem => ({
  title: "",
  content: "",
});

export const defaultFaqItem = (): FaqFormItem => ({
  question: "",
  answer: "",
});

export const defaultProfileLinkItem = (): ProfileLinkFormItem => ({
  label: "",
  url: "",
});

export const defaultResumeFormValues: ResumeFormValues = {
  name: "",
  role_title: "",
  intro: "",
  avatar_url: "",
  birth_year: undefined,
  phone: "",
  public_email: "",
  location: "",
  profile_links: [],
  show_phone: false,
  show_exact_age: false,
  suggest_top_questions_in_chat: false,
  skills: [{ name: "", proficiency: "" }],
  projects: [defaultProjectItem()],
  careers: [],
  education: [],
  certifications: [],
  activities: [],
  cover_letters: [],
  owner_faqs: [],
  enabled_sections: ["careers", "education", "certifications", "cover_letters"],
  section_order: [...DEFAULT_SECTION_ORDER],
};

export const stepSchemas = [
  basicInfoStepSchema,
  careersStepSchema,
  educationOnlyStepSchema,
  certificationsStepSchema,
  activitiesStepSchema,
  skillsStepSchema,
  projectsStepSchema,
  coverLetterStepSchema,
  faqsStepSchema,
] as const;
