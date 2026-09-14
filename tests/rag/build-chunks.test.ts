import { describe, expect, it } from "vitest";

import {
  SAMPLE_SYSTEM_PROMPT_INPUT,
  type SystemPromptInput,
} from "@/lib/prompt/build-system-prompt";
import { buildProfileChunks } from "@/lib/rag/build-chunks";

function withInput(overrides: Partial<SystemPromptInput>): SystemPromptInput {
  return { ...SAMPLE_SYSTEM_PROMPT_INPUT, ...overrides };
}

describe("buildProfileChunks", () => {
  it("produces chunks for the sample profile", () => {
    const chunks = buildProfileChunks(SAMPLE_SYSTEM_PROMPT_INPUT);
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.every((c) => c.content.trim().length > 0)).toBe(true);
    expect(chunks.every((c) => c.title.trim().length > 0)).toBe(true);
  });

  it("never indexes basic info or contact details", () => {
    const chunks = buildProfileChunks(SAMPLE_SYSTEM_PROMPT_INPUT);
    const keys = new Set(chunks.map((c) => c.section_key));
    expect(keys.has("profile")).toBe(false);
    expect(keys.has("contact")).toBe(false);
    const joined = chunks.map((c) => c.content).join("\n");
    expect(joined).not.toContain("clone@example.com");
  });

  it("numbers ordinals from zero within each section", () => {
    const chunks = buildProfileChunks(SAMPLE_SYSTEM_PROMPT_INPUT);
    const bySection = new Map<string, number[]>();
    for (const chunk of chunks) {
      bySection.set(chunk.section_key, [
        ...(bySection.get(chunk.section_key) ?? []),
        chunk.ordinal,
      ]);
    }
    for (const ordinals of bySection.values()) {
      expect(ordinals).toEqual(ordinals.map((_, i) => i));
    }
  });

  it("omits sections the owner disabled", () => {
    const chunks = buildProfileChunks(withInput({ enabledSections: [] }));
    const keys = new Set(chunks.map((c) => c.section_key));
    expect(keys.has("career")).toBe(false);
    expect(keys.has("education")).toBe(false);
    expect(keys.has("certifications")).toBe(false);
    expect(keys.has("cover_letter")).toBe(false);
    expect(keys.has("portfolio")).toBe(false);
    // Skills and projects are core sections and stay.
    expect(keys.has("skills")).toBe(true);
    expect(keys.has("project")).toBe(true);
  });

  it("honours the legacy education_certifications key", () => {
    const chunks = buildProfileChunks(
      withInput({ enabledSections: ["education_certifications"] }),
    );
    const keys = new Set(chunks.map((c) => c.section_key));
    expect(keys.has("education")).toBe(true);
    expect(keys.has("certifications")).toBe(true);
  });

  it("splits a long cover letter and repeats the heading on each piece", () => {
    const paragraph = "가".repeat(700);
    const chunks = buildProfileChunks(
      withInput({
        enabledSections: ["cover_letters"],
        coverLetters: [
          {
            title: "지원 동기",
            content: `${paragraph}\n\n${paragraph}\n\n${paragraph}`,
            sort_order: 0,
          },
        ],
      }),
    );

    const pieces = chunks.filter((c) => c.section_key === "cover_letter");
    expect(pieces.length).toBeGreaterThan(1);
    expect(pieces.every((p) => p.content.includes("지원 동기"))).toBe(true);
  });

  it("keeps a short cover letter as a single chunk", () => {
    const chunks = buildProfileChunks(
      withInput({
        enabledSections: ["cover_letters"],
        coverLetters: [
          { title: "지원 동기", content: "짧은 내용", sort_order: 0 },
        ],
      }),
    );
    expect(chunks.filter((c) => c.section_key === "cover_letter")).toHaveLength(
      1,
    );
  });

  it("renders FAQ chunks as a Q/A pair", () => {
    const chunks = buildProfileChunks(
      withInput({ enabledSections: ["owner_faqs"] }),
    );
    const faq = chunks.find((c) => c.section_key === "faq");
    expect(faq?.content).toMatch(/^Q: /);
    expect(faq?.content).toContain("\nA: ");
  });

  it("is deterministic for the same input", () => {
    const a = buildProfileChunks(SAMPLE_SYSTEM_PROMPT_INPUT);
    const b = buildProfileChunks(SAMPLE_SYSTEM_PROMPT_INPUT);
    expect(a).toEqual(b);
  });
});
