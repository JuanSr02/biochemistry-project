import { create } from 'zustand';
import type { SolucionSolidaResultado, DilucionResultado } from '../types';

interface HistorialEntry {
  id: string;
  tipo: 'solida' | 'dilucion';
  timestamp: number;
  resultado: SolucionSolidaResultado | DilucionResultado;
}

interface CalculadoraState {
  modoAvanzado: boolean;
  /** Último resultado de Solución Sólida */
  ultimoResultadoSolida: SolucionSolidaResultado | null;
  /** Último resultado de Dilución */
  ultimoResultadoDilucion: DilucionResultado | null;
  /** Historial de los últimos 20 cálculos de la sesión */
  historial: HistorialEntry[];

  // Acciones
  toggleModoAvanzado: () => void;
  setResultadoSolida: (resultado: SolucionSolidaResultado | null) => void;
  setResultadoDilucion: (resultado: DilucionResultado | null) => void;
  addToHistorial: (entry: Omit<HistorialEntry, 'id' | 'timestamp'>) => void;
  clearHistorial: () => void;
}

export const useCalculadoraStore = create<CalculadoraState>((set) => ({
  modoAvanzado: false,
  ultimoResultadoSolida: null,
  ultimoResultadoDilucion: null,
  historial: [],

  toggleModoAvanzado: () => set((state) => ({ modoAvanzado: !state.modoAvanzado })),

  setResultadoSolida: (resultado) => set({ ultimoResultadoSolida: resultado }),

  setResultadoDilucion: (resultado) => set({ ultimoResultadoDilucion: resultado }),

  addToHistorial: (entry) =>
    set((state) => ({
      historial: [
        { ...entry, id: `calc-${Date.now()}`, timestamp: Date.now() },
        ...state.historial,
      ].slice(0, 20), // Máximo 20 entradas
    })),

  clearHistorial: () => set({ historial: [] }),
}));
