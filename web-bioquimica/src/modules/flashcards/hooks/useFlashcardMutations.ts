import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/query-keys';
import { useAppStore } from '@/core/store/useAppStore';
import {
  offlineRegistrarRespuesta,
  offlineCrearFlashcard,
  offlineActualizarFlashcard,
  offlineEliminarFlashcard,
} from '../lib/offline-actions';
import type { CrearFlashcardInput, ActualizarFlashcardInput } from '../types';

/**
 * Mutations CRUD + respuesta para el módulo de Flashcards.
 * - Offline-aware: si no hay red, delega a IndexedDB y encola la operación.
 */
export function useFlashcardMutations() {
  const queryClient = useQueryClient();
  const usuario = useAppStore((s) => s.usuario);
  const userId = usuario?.id;

  const invalidateTarjetas = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.flashcards.tarjetas(userId) });

  const responderMutation = useMutation({
    mutationFn: ({ id, calidad }: { id: string; calidad: number }) =>
      offlineRegistrarRespuesta(id, calidad),
    onSuccess: () => invalidateTarjetas(),
  });

  const crearMutation = useMutation({
    mutationFn: (input: CrearFlashcardInput) => offlineCrearFlashcard(input),
    onSuccess: () => invalidateTarjetas(),
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ActualizarFlashcardInput }) =>
      offlineActualizarFlashcard(id, input),
    onSuccess: () => invalidateTarjetas(),
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: string) => offlineEliminarFlashcard(id),
    onSuccess: () => invalidateTarjetas(),
  });

  return {
    responder: responderMutation,
    crear: crearMutation,
    actualizar: actualizarMutation,
    eliminar: eliminarMutation,
  };
}
