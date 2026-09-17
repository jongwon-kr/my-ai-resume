import { create } from "zustand";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface ResumeBuilderState {
  currentStep: number;
  profileId: string | null;
  slug: string | null;
  /** True on /demo/*, where nothing may be written to storage or the DB. */
  demoMode: boolean;
  saveStatus: SaveStatus;
  saveError: string | null;
  lastSavedAt: Date | null;
  setProfileMeta: (profileId: string, slug: string, demoMode: boolean) => void;
  setStep: (step: number) => void;
  setSaving: () => void;
  setSaved: () => void;
  setSaveError: (message: string) => void;
}

export const useResumeBuilderStore = create<ResumeBuilderState>((set) => ({
  currentStep: 1,
  profileId: null,
  slug: null,
  demoMode: false,
  saveStatus: "idle",
  saveError: null,
  lastSavedAt: null,
  setProfileMeta: (profileId, slug, demoMode) =>
    set({ profileId, slug, demoMode }),
  setStep: (step) => set({ currentStep: step }),
  setSaving: () => set({ saveStatus: "saving", saveError: null }),
  setSaved: () =>
    set({ saveStatus: "saved", saveError: null, lastSavedAt: new Date() }),
  setSaveError: (message) => set({ saveStatus: "error", saveError: message }),
}));
