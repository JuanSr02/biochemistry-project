import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/query-keys';
import { offlineGetLaboratorios } from '../lib/offline-actions';
import { useAppStore } from '@/core/store/useAppStore';

/**
 * Hook para obtener los laboratorios del usuario autenticado.
 * - Offline-aware: si no hay red, sirve datos desde IndexedDB.
 */
export function useLaboratorios() {
  const usuario = useAppStore((s) => s.usuario);
  const userId = usuario?.id;

  return useQuery({
    queryKey: queryKeys.academico.laboratorios(userId),
    queryFn: () => offlineGetLaboratorios(userId),
    enabled: !!userId,
    select: (res) => (res.success ? res.data : []),
    staleTime: 5 * 60 * 1000,
  });
}
