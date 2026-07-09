import { describe, expect, it } from "vitest";

import {
  getPublicContentStepOrder,
  getStepsInOrder,
  normalizeSectionOrder,
  reorderVisibleSteps,
} from "@/lib/resume/section-order";

describe("section-order", () => {
  const enabled = [
    "careers",
    "education",
    "certifications",
    "cover_letters",
  ] as const;

  it("normalizes missing ids", () => {
    expect(normalizeSectionOrder([1, 3, 2])).toEqual([1, 3, 2, 4, 5, 6, 7, 8, 9]);
  });

  it("orders visible sidebar steps", () => {
    const order = [1, 7, 2, 3, 4, 5, 6, 8, 9];
    const steps = getStepsInOrder(order, [...enabled]);
    expect(steps.map((step) => step.id)).toEqual([1, 7, 2, 3, 4, 6, 8]);
  });

  it("reorders visible steps while keeping hidden slots", () => {
    const sectionOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const visible = [1, 2, 3, 4, 6, 7, 8];
    const next = reorderVisibleSteps(sectionOrder, visible, 5, 1);
    expect(next).toEqual([1, 7, 2, 3, 4, 5, 6, 8, 9]);
  });

  it("excludes header and faq from public content order", () => {
    expect(getPublicContentStepOrder([1, 7, 2, 3, 4, 5, 6, 8, 9])).toEqual([
      7, 2, 3, 4, 5, 6, 8,
    ]);
  });
});
