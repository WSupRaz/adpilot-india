import { create } from "zustand";

interface AuthState {
  activeBusiness: string | null;
  setActiveBusiness: (id: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  activeBusiness: null,
  setActiveBusiness: (id) => set({ activeBusiness: id }),
}));
