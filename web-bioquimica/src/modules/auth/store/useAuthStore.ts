import { create } from 'zustand';

interface AuthState {
  isModalOpen: boolean;
  setModalOpen: (isOpen: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isModalOpen: false,
  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
}));
