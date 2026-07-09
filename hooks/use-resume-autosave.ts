"use client";

import { useCallback, useEffect, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";

import { AUTOSAVE_INTERVAL_MS } from "@/lib/resume/schema";
import type { ResumeFormValues } from "@/lib/resume/schema";
import { saveResumeDraft } from "@/lib/resume/persistence";
import { createClient } from "@/lib/supabase/client";
import { useResumeBuilderStore } from "@/stores/resume-builder-store";

export function useResumeAutosave(
  form: UseFormReturn<ResumeFormValues>,
  demoMode = false,
) {
  const profileId = useResumeBuilderStore((state) => state.profileId);
  const { setSaving, setSaved, setSaveError } = useResumeBuilderStore();
  const savingRef = useRef(false);
  const rerunRef = useRef(false);
  // Snapshot of the last successfully saved values. Used to skip redundant
  // saves instead of `form.reset()`, which would steal focus from the field
  // being edited when an autosave lands mid-typing.
  const lastSavedRef = useRef<string | null>(null);

  const persistDraft = useCallback(async () => {
    if (demoMode || !profileId) {
      return;
    }

    // Coalesce concurrent calls: if a save is running, request one more pass
    // once it finishes so rapid toggles/clicks are never dropped.
    if (savingRef.current) {
      rerunRef.current = true;
      return;
    }

    savingRef.current = true;

    try {
      do {
        rerunRef.current = false;

        const snapshot = JSON.stringify(form.getValues());
        if (snapshot === lastSavedRef.current) {
          break;
        }

        setSaving();
        const supabase = createClient();
        await saveResumeDraft(supabase, profileId, form.getValues());
        lastSavedRef.current = snapshot;
        setSaved();
      } while (rerunRef.current);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "자동 저장에 실패했습니다.",
      );
    } finally {
      savingRef.current = false;
    }
  }, [profileId, form, setSaving, setSaved, setSaveError, demoMode]);

  const saveOnBlur = useCallback(() => {
    if (form.formState.isDirty) {
      void persistDraft();
    }
  }, [form, persistDraft]);

  useEffect(() => {
    if (demoMode || !profileId) {
      return;
    }

    const timer = window.setInterval(() => {
      if (form.formState.isDirty) {
        void persistDraft();
      }
    }, AUTOSAVE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [profileId, form, persistDraft, demoMode]);

  return { saveOnBlur, persistDraft };
}
