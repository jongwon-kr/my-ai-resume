import { z } from "zod";

import type { ResumeFormValues } from "@/lib/resume/schema";

const looseString = z.string().optional().default("");

export const geminiResumeImportResponseSchema = z.object({
  name: looseString,
  role_title: looseString,
  intro: looseString,
  birth_year: z.number().int().nullable().optional(),
  phone: looseString,
  public_email: looseString,
  location: looseString,
  github_url: looseString,
  linkedin_url: looseString,
  blog_url: looseString,
  careers: z
    .array(
      z.object({
        company: looseString,
        position: looseString,
        period: looseString,
        description: looseString,
      }),
    )
    .optional()
    .default([]),
  education: z
    .array(
      z.object({
        school: looseString,
        major: looseString,
        degree: looseString,
        status: looseString,
        period: looseString,
      }),
    )
    .optional()
    .default([]),
  certifications: z
    .array(
      z.object({
        name: looseString,
        issuer: looseString,
        acquired_date: looseString,
      }),
    )
    .optional()
    .default([]),
  skills: z
    .array(
      z.object({
        name: looseString,
        proficiency: looseString,
      }),
    )
    .optional()
    .default([]),
  projects: z
    .array(
      z.object({
        title: looseString,
        period: looseString,
        role: looseString,
        tech_stack: looseString,
        situation: looseString,
        actions: looseString,
        results: looseString,
        troubleshooting: looseString,
      }),
    )
    .optional()
    .default([]),
  cover_letters: z
    .array(
      z.object({
        title: looseString,
        content: looseString,
      }),
    )
    .optional()
    .default([]),
  owner_faqs: z
    .array(
      z.object({
        question: looseString,
        answer: looseString,
      }),
    )
    .optional()
    .default([]),
  needs_review: z.array(z.string()).optional().default([]),
});

export type GeminiResumeImportResponse = z.infer<
  typeof geminiResumeImportResponseSchema
>;

export interface ResumeImportApiResponse {
  imported: ResumeFormValues;
  needsReview: string[];
  summary: {
    careers: number;
    education: number;
    certifications: number;
    skills: number;
    projects: number;
    coverLetters: number;
    ownerFaqs: number;
  };
}
