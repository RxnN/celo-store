"use client";

import { create } from "zustand";

type AdminToastState = {
  message: string | null;
  token: number;
  show: (message: string) => void;
  hide: () => void;
};

export const useAdminToastStore = create<AdminToastState>((set) => ({
  message: null,
  token: 0,
  show: (message) => set((state) => ({ message, token: state.token + 1 })),
  hide: () => set({ message: null }),
}));
