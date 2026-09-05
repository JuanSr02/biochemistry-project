import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/query-keys';
import { useAppStore } from '@/core/store/useAppStore';
import {
  registrarRespuestaFlashcard,
  crearFlashcard,
  actualizarFlashcard,
  eliminarFlashcard,
} from '../actions';
import type { CrearFlashcardInput, ActualizarFlashcardInput } from '../types';

/**
 * Mutations CRUD + respuesta para el módulo de Flashcards.
 */
export function useFlashcardMutations() {
  const queryClient = useQueryClient();
  const usuario = useAppStore((s) => s.usuario);
  const userId = usuario?.id;

  const invalidateTarjetas = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.flashcards.tarjetas(userId) });

  const responderMutation = useMutation({
    mutationFn: ({ id, sabias }: { id: string; sabias: boolean }) =>
      registrarRespuestaFlashcard(id, sabias),
    onSuccess: () => invalidateTarjetas(),
  });

  const crearMutation = useMutation({
    mutationFn: (input: CrearFlashcardInput) => crearFlashcard(input),
    onSuccess: () => invalidateTarjetas(),
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ActualizarFlashcardInput }) =>
      actualizarFlashcard(id, input),
    onSuccess: () => invalidateTarjetas(),
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: string) => eliminarFlashcard(id),
    onSuccess: () => invalidateTarjetas(),
  });

  return {
    responder: responderMutation,
    crear: crearMutation,
    actualizar: actualizarMutation,
    eliminar: eliminarMutation,
  };
}
