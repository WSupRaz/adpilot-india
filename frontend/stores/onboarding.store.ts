import { create } from "zustand";

interface OnboardingStep {
  id: string;
  completed: boolean;
}

interface OnboardingState {
  steps: OnboardingStep[];
  currentStep: number;
  setStep: (step: number) => void;
  completeStep: (id: string) => void;
  isComplete: boolean;
}

const STEPS: OnboardingStep[] = [
  { id: "create_business", completed: false },
  { id: "first_campaign", completed: false },
  { id: "connect_ad_account", completed: false },
];

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  steps: STEPS,
  currentStep: 0,
  isComplete: false,
  setStep: (step) => set({ currentStep: step }),
  completeStep: (id) => {
    const steps = get().steps.map((s) =>
      s.id === id ? { ...s, completed: true } : s
    );
    set({ steps, isComplete: steps.every((s) => s.completed) });
  },
}));
