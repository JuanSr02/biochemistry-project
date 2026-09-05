import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/query-keys';
import { getLaboratorios } from '../actions';
import { useAppStore } from '@/core/store/useAppStore';

/**
 * Hook para obtener los laboratorios del usuario autenticado.
 */
export function useLaboratorios() {
  const usuario = useAppStore((s) => s.usuario);
  const userId = usuario?.id;

  return useQuery({
    queryKey: queryKeys.academico.laboratorios(userId),
    queryFn: () => getLaboratorios(userId),
    select: (res) => (res.success ? res.data : []),
    staleTime: 5 * 60 * 1000,
  });
}
