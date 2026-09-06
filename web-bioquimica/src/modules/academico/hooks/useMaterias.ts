import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/query-keys';
import { offlineGetMaterias } from '../lib/offline-actions';
import { useAppStore } from '@/core/store/useAppStore';

/**
 * Hook para obtener todas las materias del usuario autenticado.
 * - Offline-aware: si no hay red, sirve datos desde IndexedDB.
 * - Usa React Query para gestión de caché y revalidación automática.
 * - Se suscribe al usuario del store de Zustand como parte de la query key,
 *   por lo que la caché se invalida automáticamente si el usuario cambia.
 */
export function useMaterias() {
  const usuario = useAppStore((s) => s.usuario);
  const userId = usuario?.id;

  return useQuery({
    queryKey: queryKeys.academico.materias(userId),
    queryFn: () => offlineGetMaterias(userId),
    enabled: !!userId,
    select: (res) => (res.success ? res.data : []),
    staleTime: 5 * 60 * 1000,
  });
}
