import {
  DEFAULT_SECTION_ORDER,
  RESUME_BUILDER_STEPS,
  type OptionalSectionKey,
} from "@/lib/resume/schema";

export type ResumeBuilderStep = (typeof RESUME_BUILDER_STEPS)[number];

/** Ensures section_order contains every builder step exactly once. */
export function normalizeSectionOrder(
  raw: readonly number[] | null | undefined,
): number[] {
  const validIds = new Set<number>(DEFAULT_SECTION_ORDER);
  const seen = new Set<number>();
  const result: number[] = [];

  for (const id of raw ?? []) {
    if (!validIds.has(id) || seen.has(id)) {
      continue;
    }
    seen.add(id);
    result.push(id);
  }

  for (const id of DEFAULT_SECTION_ORDER) {
    if (!seen.has(id)) {
      result.push(id);
    }
  }

  return result;
}

function isStepVisible(
  step: ResumeBuilderStep,
  enabledSections: readonly OptionalSectionKey[],
) {
  return !("optionalKey" in step) || enabledSections.includes(step.optionalKey);
}

export function getStepsInOrder(
  sectionOrder: readonly number[],
  enabledSections: readonly OptionalSectionKey[],
): ResumeBuilderStep[] {
  const stepMap = new Map<number, ResumeBuilderStep>(
    RESUME_BUILDER_STEPS.map((step) => [step.id, step]),
  );

  return normalizeSectionOrder(sectionOrder)
    .map((id) => stepMap.get(id))
    .filter((step): step is ResumeBuilderStep => Boolean(step))
    .filter((step) => isStepVisible(step, enabledSections));
}

export function getVisibleStepIds(
  sectionOrder: readonly number[],
  enabledSections: readonly OptionalSectionKey[],
) {
  return getStepsInOrder(sectionOrder, enabledSections).map((step) => step.id);
}

/** Reorders visible sidebar steps while preserving hidden step positions. */
export function reorderVisibleSteps(
  sectionOrder: readonly number[],
  visibleStepIds: readonly number[],
  from: number,
  to: number,
): number[] {
  if (from === to || from < 0 || to < 0 || from >= visibleStepIds.length) {
    return [...sectionOrder];
  }

  const reorderedVisible = [...visibleStepIds];
  const [moved] = reorderedVisible.splice(from, 1);
  reorderedVisible.splice(to, 0, moved);

  const visibleSet = new Set(visibleStepIds);
  const queue = [...reorderedVisible];

  return normalizeSectionOrder(sectionOrder).map((stepId) => {
    if (visibleSet.has(stepId)) {
      return queue.shift() ?? stepId;
    }
    return stepId;
  });
}

/** Step ids rendered on the public profile after the header (excludes FAQ). */
export function getPublicContentStepOrder(sectionOrder: readonly number[]) {
  return normalizeSectionOrder(sectionOrder).filter(
    (id) => id !== 1 && id !== 9,
  );
}
