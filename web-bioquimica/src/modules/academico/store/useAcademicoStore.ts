import { create } from 'zustand';

interface AcademicoState {
  semestreActual: string | null;
  setSemestreActual: (semestre: string | null) => void;
}

export const useAcademicoStore = create<AcademicoState>((set) => ({
  semestreActual: null,
  setSemestreActual: (semestre) => set({ semestreActual: semestre }),
}));
