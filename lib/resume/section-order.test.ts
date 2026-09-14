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
    expect(normalizeSectionOrder([1, 3, 2])).toEqual([
      1, 3, 2, 4, 5, 6, 7, 10, 8, 9,
    ]);
  });

  it("appends the portfolio step for profiles saved before it existed", () => {
    expect(normalizeSectionOrder([1, 2, 3, 4, 5, 6, 7, 8, 9])).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
  });

  it("keeps a custom portfolio position once the owner has moved it", () => {
    expect(normalizeSectionOrder([10, 1, 2, 3, 4, 5, 6, 7, 8, 9])).toEqual([
      10, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);
  });

  it("hides the portfolio step unless the section is enabled", () => {
    const order = [1, 6, 7, 10];
    expect(getStepsInOrder(order, ["careers"]).map((s) => s.id)).not.toContain(
      10,
    );
    expect(
      getStepsInOrder(order, ["portfolio_items"]).map((s) => s.id),
    ).toContain(10);
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
    // Hidden steps (5, 9, 10) keep their slots; only visible ids are permuted.
    expect(next).toEqual([1, 7, 2, 3, 5, 4, 6, 8, 9, 10]);
  });

  it("excludes header and faq from public content order", () => {
    expect(getPublicContentStepOrder([1, 7, 2, 3, 4, 5, 6, 8, 9])).toEqual([
      7, 2, 3, 4, 5, 6, 8, 10,
    ]);
  });
});
