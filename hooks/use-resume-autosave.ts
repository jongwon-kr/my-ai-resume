"use client";

import { useCallback, useEffect, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";

import { AUTOSAVE_INTERVAL_MS } from "@/lib/resume/schema";
import type { ResumeFormValues } from "@/lib/resume/schema";
import { saveResumeDraft } from "@/lib/resume/persistence";
import { createClient } from "@/lib/supabase/client";
import { useResumeBuilderStore } from "@/stores/resume-builder-store";

export function useResumeAutosave(form: UseFormReturn<ResumeFormValues>) {
  const profileId = useResumeBuilderStore((state) => state.profileId);
  const { setSaving, setSaved, setSaveError } = useResumeBuilderStore();
  const savingRef = useRef(false);

  const persistDraft = useCallback(
    async (values: ResumeFormValues) => {
      if (!profileId || savingRef.current) {
        return;
      }

      savingRef.current = true;
      setSaving();

      try {
        const supabase = createClient();
        await saveResumeDraft(supabase, profileId, values);
        form.reset(values, { keepDirty: false });
        setSaved();
      } catch (error) {
        setSaveError(
          error instanceof Error ? error.message : "자동 저장에 실패했습니다.",
        );
      } finally {
        savingRef.current = false;
      }
    },
    [profileId, form, setSaving, setSaved, setSaveError],
  );

  const saveOnBlur = useCallback(() => {
    if (form.formState.isDirty) {
      void persistDraft(form.getValues());
    }
  }, [form, persistDraft]);

  useEffect(() => {
    if (!profileId) {
      return;
    }

    const timer = window.setInterval(() => {
      if (form.formState.isDirty) {
        void persistDraft(form.getValues());
      }
    }, AUTOSAVE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [profileId, form, persistDraft]);

  return { saveOnBlur, persistDraft };
}
