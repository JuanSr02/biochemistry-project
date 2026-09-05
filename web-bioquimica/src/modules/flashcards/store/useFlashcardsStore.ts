import { create } from 'zustand';

interface FlashcardsState {
  mazoActivo: string | null;
  modoEstudio: boolean;
  setMazoActivo: (id: string | null) => void;
  setModoEstudio: (activo: boolean) => void;
}

export const useFlashcardsStore = create<FlashcardsState>((set) => ({
  mazoActivo: null,
  modoEstudio: false,
  setMazoActivo: (id) => set({ mazoActivo: id }),
  setModoEstudio: (activo) => set({ modoEstudio: activo }),
}));
