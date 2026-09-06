import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/query-keys';
import { getTarjetasEstudio } from '../actions';
import { useAppStore } from '@/core/store/useAppStore';

/**
 * @deprecated Usar useTarjetas de '@/modules/flashcards/hooks/useTarjetas'
 * Este archivo se mantiene por compatibilidad con imports anteriores.
 */
export const useMazos = () => {
  const usuario = useAppStore((s) => s.usuario);
  const userId = usuario?.id;

  return useQuery({
    queryKey: queryKeys.flashcards.tarjetas(userId),
    queryFn: () => getTarjetasEstudio(userId),
    enabled: !!userId,
    select: (res) => (res.success ? res.data : []),
    staleTime: 5 * 60 * 1000,
  });
};
