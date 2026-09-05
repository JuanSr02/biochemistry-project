import { create } from 'zustand';

interface CalculadoraState {
  modoAvanzado: boolean;
  toggleModoAvanzado: () => void;
}

export const useCalculadoraStore = create<CalculadoraState>((set) => ({
  modoAvanzado: false,
  toggleModoAvanzado: () => set((state) => ({ modoAvanzado: !state.modoAvanzado })),
}));
