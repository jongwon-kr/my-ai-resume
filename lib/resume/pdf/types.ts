import type { ResumeFormValues } from "@/lib/resume/schema";

export interface ResumePdfInput {
  slug: string;
  values: ResumeFormValues;
}
