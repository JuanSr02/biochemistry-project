import { create } from 'zustand';

interface AuthState {
  /** true si el modal de bienvenida/confirmación está abierto */
  isModalOpen: boolean;
  setModalOpen: (isOpen: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isModalOpen: false,
  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
}));
