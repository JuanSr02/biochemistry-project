import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/query-keys';
import { getMaterias } from '../actions';
import { useAppStore } from '@/core/store/useAppStore';

/**
 * Hook para obtener todas las materias del usuario autenticado.
 * - Usa React Query para gestión de caché y revalidación automática.
 * - Se suscribe al usuario del store de Zustand como parte de la query key,
 *   por lo que la caché se invalida automáticamente si el usuario cambia.
 */
export function useMaterias() {
  const usuario = useAppStore((s) => s.usuario);
  const userId = usuario?.id;

  return useQuery({
    queryKey: queryKeys.academico.materias(userId),
    queryFn: () => getMaterias(userId),
    // Transformar al formato que los componentes esperan
    select: (res) => (res.success ? res.data : []),
    staleTime: 5 * 60 * 1000, // 5 minutos en caché
  });
}
