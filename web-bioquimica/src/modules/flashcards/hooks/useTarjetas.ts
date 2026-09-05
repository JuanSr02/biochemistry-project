import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/query-keys';
import { getTarjetasEstudio } from '../actions';
import { useAppStore } from '@/core/store/useAppStore';

/**
 * Hook para obtener tarjetas de estudio del usuario autenticado.
 */
export function useTarjetas() {
  const usuario = useAppStore((s) => s.usuario);
  const userId = usuario?.id;

  return useQuery({
    queryKey: queryKeys.flashcards.tarjetas(userId),
    queryFn: () => getTarjetasEstudio(userId),
    select: (res) => (res.success ? res.data : []),
    staleTime: 5 * 60 * 1000,
  });
}
