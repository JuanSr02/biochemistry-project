import { useMutation } from '@tanstack/react-query';
import { useCalculadoraStore } from '../store/useCalculadoraStore';
import { calcularSolucionSolida, calcularDilucion } from '../actions';
import type { SolucionSolidaInput, DilucionInput } from '../types';

/**
 * useMutation para el cálculo de Solución Sólida.
 * - Guarda el resultado en el store de Zustand (historial + último resultado).
 * - La query fn es la Server Action existente, sin cambios.
 */
export function useCalcularSolucionSolida() {
  const { setResultadoSolida, addToHistorial } = useCalculadoraStore();

  return useMutation({
    mutationFn: (input: SolucionSolidaInput) => calcularSolucionSolida(input),
    onSuccess: (res) => {
      if (res.success && res.data) {
        setResultadoSolida(res.data);
        addToHistorial({ tipo: 'solida', resultado: res.data });
      } else {
        setResultadoSolida(null);
      }
    },
  });
}

/**
 * useMutation para el cálculo de Dilución.
 */
export function useCalcularDilucion() {
  const { setResultadoDilucion, addToHistorial } = useCalculadoraStore();

  return useMutation({
    mutationFn: (input: DilucionInput) => calcularDilucion(input),
    onSuccess: (res) => {
      if (res.success && res.data) {
        setResultadoDilucion(res.data);
        addToHistorial({ tipo: 'dilucion', resultado: res.data });
      } else {
        setResultadoDilucion(null);
      }
    },
  });
}
