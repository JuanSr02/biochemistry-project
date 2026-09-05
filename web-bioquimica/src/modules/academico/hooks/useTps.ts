import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/query-keys';
import { getTrabajosPracticos } from '../actions';
import { useAppStore } from '@/core/store/useAppStore';

/**
 * Hook para obtener los trabajos prácticos del usuario autenticado.
 */
export function useTps() {
  const usuario = useAppStore((s) => s.usuario);
  const userId = usuario?.id;

  return useQuery({
    queryKey: queryKeys.academico.tps(userId),
    queryFn: () => getTrabajosPracticos(userId),
    select: (res) => (res.success ? res.data : []),
    staleTime: 5 * 60 * 1000,
  });
}
