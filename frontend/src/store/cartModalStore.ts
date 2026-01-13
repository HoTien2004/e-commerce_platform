import { create } from 'zustand';
import type { Product } from '../types/product';

interface CartModalItem {
  id: string;
  product: Product;
  quantity: number;
  timestamp: number;
}

interface CartModalStore {
  modals: CartModalItem[];
  addModal: (product: Product, quantity: number) => void;
  removeModal: (id: string) => void;
  clearModals: () => void;
}

export const useCartModalStore = create<CartModalStore>((set) => ({
  modals: [],
  addModal: (product, quantity) => {
    const id = `modal-${Date.now()}-${Math.random()}`;
    set((state) => ({
      modals: [...state.modals, { id, product, quantity, timestamp: Date.now() }],
    }));
  },
  removeModal: (id) => {
    set((state) => ({
      modals: state.modals.filter((modal) => modal.id !== id),
    }));
  },
  clearModals: () => {
    set({ modals: [] });
  },
}));

