import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/query-keys';

// Simulación de fetch
const fetchUser = async () => {
  // Aquí iría la llamada real a Supabase auth.getUser()
  return { id: '1', name: 'Usuario Ejemplo', role: 'admin' };
};

export const useUser = () => {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: fetchUser,
  });
};
