import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { iniciarSesion } from '../actions';
import { useAppStore } from '@/core/store/useAppStore';

/**
 * useMutation para iniciar sesión.
 * - Inicia sesión en cliente Supabase Auth para persistir token JWT en localStorage.
 * - Actualiza el store global de Zustand con el usuario autenticado.
 * - Redirige al dashboard en caso de éxito.
 */
export function useLoginMutation() {
  const router = useRouter();
  const setUsuario = useAppStore((s) => s.setUsuario);

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return iniciarSesion(email, password);
    },
    onSuccess: (res) => {
      if ("user" in res && res.success && res.user) {
        // 1. Persistir en Zustand (fuente de verdad global del cliente)
        setUsuario(res.user);
        // 2. Persistir en localStorage para compatibilidad con código existente
        localStorage.setItem('biotools_user', JSON.stringify(res.user));
        router.push('/dashboard');
      }
    },
  });
}
