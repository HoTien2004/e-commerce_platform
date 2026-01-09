import { create } from 'zustand';

interface ModalState {
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isAuthModalOpen: false,
  authModalMode: 'login',
  openAuthModal: (mode = 'login') => {
    set({ isAuthModalOpen: true, authModalMode: mode });
  },
  closeAuthModal: () => {
    set({ isAuthModalOpen: false });
  },
}));

