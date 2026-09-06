import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/query-keys';
import { offlineGetTarjetas } from '../lib/offline-actions';
import { useAppStore } from '@/core/store/useAppStore';

/**
 * Hook para obtener tarjetas de estudio del usuario autenticado.
 * - Offline-aware: si no hay red, sirve datos desde IndexedDB.
 */
export function useTarjetas() {
  const usuario = useAppStore((s) => s.usuario);
  const userId = usuario?.id;

  return useQuery({
    queryKey: queryKeys.flashcards.tarjetas(userId),
    queryFn: () => offlineGetTarjetas(userId),
    enabled: !!userId,
    select: (res) => (res.success ? res.data : []),
    staleTime: 5 * 60 * 1000,
  });
}
