import { create } from 'zustand';

interface SessionStats {
  aciertos: number;
  errores: number;
}

interface FlashcardsState {
  /** ID del mazo/materia activo para filtrar tarjetas */
  mazoActivo: string;
  /** Índice de la tarjeta actual en la sesión */
  indexActual: number;
  /** Estadísticas de la sesión actual de repaso */
  stats: SessionStats;
  /** Si el usuario está en modo estudio activo (vs. gestión) */
  modoEstudio: boolean;

  // Acciones
  setMazoActivo: (id: string) => void;
  setModoEstudio: (activo: boolean) => void;
  registrarAcierto: () => void;
  registrarError: () => void;
  avanzarTarjeta: (total: number) => void;
  reiniciarSesion: () => void;
}

export const useFlashcardsStore = create<FlashcardsState>((set) => ({
  mazoActivo: 'todas',
  indexActual: 0,
  stats: { aciertos: 0, errores: 0 },
  modoEstudio: false,

  setMazoActivo: (id) => set({ mazoActivo: id, indexActual: 0, stats: { aciertos: 0, errores: 0 } }),
  setModoEstudio: (activo) => set({ modoEstudio: activo }),
  registrarAcierto: () =>
    set((state) => ({ stats: { ...state.stats, aciertos: state.stats.aciertos + 1 } })),
  registrarError: () =>
    set((state) => ({ stats: { ...state.stats, errores: state.stats.errores + 1 } })),
  avanzarTarjeta: (total) =>
    set((state) => ({ indexActual: state.indexActual < total - 1 ? state.indexActual + 1 : 0 })),
  reiniciarSesion: () => set({ indexActual: 0, stats: { aciertos: 0, errores: 0 } }),
}));
