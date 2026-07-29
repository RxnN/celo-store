"use client";

import { create } from "zustand";

export type CartToastItem = {
  name: string;
  image: string | null;
  price: number;
  quantity: number;
};

type CartToastState = {
  item: CartToastItem | null;
  token: number;
  show: (item: CartToastItem) => void;
  hide: () => void;
};

export const useCartToastStore = create<CartToastState>((set) => ({
  item: null,
  token: 0,
  show: (item) => set((state) => ({ item, token: state.token + 1 })),
  hide: () => set({ item: null }),
}));
