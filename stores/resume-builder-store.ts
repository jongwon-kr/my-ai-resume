import { create } from "zustand";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface ResumeBuilderState {
  currentStep: number;
  profileId: string | null;
  slug: string | null;
  saveStatus: SaveStatus;
  saveError: string | null;
  lastSavedAt: Date | null;
  setProfileMeta: (profileId: string, slug: string) => void;
  setStep: (step: number) => void;
  setSaving: () => void;
  setSaved: () => void;
  setSaveError: (message: string) => void;
}

export const useResumeBuilderStore = create<ResumeBuilderState>((set) => ({
  currentStep: 1,
  profileId: null,
  slug: null,
  saveStatus: "idle",
  saveError: null,
  lastSavedAt: null,
  setProfileMeta: (profileId, slug) => set({ profileId, slug }),
  setStep: (step) => set({ currentStep: step }),
  setSaving: () => set({ saveStatus: "saving", saveError: null }),
  setSaved: () =>
    set({ saveStatus: "saved", saveError: null, lastSavedAt: new Date() }),
  setSaveError: (message) => set({ saveStatus: "error", saveError: message }),
}));
