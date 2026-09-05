import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { iniciarSesion } from '../actions';
import { useAppStore } from '@/core/store/useAppStore';

/**
 * useMutation para iniciar sesión.
 * - Actualiza el store global de Zustand con el usuario autenticado.
 * - Persiste en localStorage para compatibilidad con el sistema de cookies existente.
 * - Redirige al dashboard en caso de éxito.
 */
export function useLoginMutation() {
  const router = useRouter();
  const setUsuario = useAppStore((s) => s.setUsuario);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      iniciarSesion(email, password),
    onSuccess: (res) => {
      if (res.success && res.user) {
        // 1. Persistir en Zustand (fuente de verdad global del cliente)
        setUsuario(res.user);
        // 2. Persistir en localStorage para compatibilidad con código existente
        localStorage.setItem('biotools_user', JSON.stringify(res.user));
        router.push('/dashboard');
      }
    },
  });
}
