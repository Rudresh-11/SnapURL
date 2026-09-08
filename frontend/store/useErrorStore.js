"use client";

import { create } from "zustand";

export const useErrorStore = create((set) => ({
  error: null,
  errorId: 0,
  setError: (error) => set((s) => ({ error, errorId: s.errorId + 1 })),
  clearError: () => set({ error: null }),
}));
