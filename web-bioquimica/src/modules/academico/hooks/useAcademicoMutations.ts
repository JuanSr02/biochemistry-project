import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/query-keys';
import { useAppStore } from '@/core/store/useAppStore';
import {
  crearMateria,
  actualizarMateria,
  eliminarMateria,
  crearTrabajoPractico,
  actualizarTrabajoPractico,
  cambiarEstadoTP,
  eliminarTrabajoPractico,
  crearLaboratorio,
  actualizarLaboratorio,
  cambiarEstadoLaboratorio,
  eliminarLaboratorio,
  toggleTareaLaboratorio,
} from '../actions';
import type {
  CrearMateriaInput,
  CrearTrabajoPracticoInput,
  CrearLaboratorioInput,
  EstadoTP,
  EstadoLaboratorio,
} from '../types';

/**
 * Mutations CRUD para el módulo académico.
 * Todas las mutations invalidan automáticamente las queries correspondientes
 * para refrescar la UI sin necesidad de `onRefresh` callbacks manuales.
 */
export function useAcademicoMutations() {
  const queryClient = useQueryClient();
  const usuario = useAppStore((s) => s.usuario);
  const userId = usuario?.id;

  const invalidateMaterias = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.academico.materias(userId) });
  const invalidateTps = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.academico.tps(userId) });
  const invalidateLaboratorios = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.academico.laboratorios(userId) });

  // ── MATERIAS ──────────────────────────────────────────────────────────────
  const crearMateriaMutation = useMutation({
    mutationFn: (input: CrearMateriaInput) => crearMateria(input),
    onSuccess: () => invalidateMaterias(),
  });

  const actualizarMateriaMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CrearMateriaInput> }) =>
      actualizarMateria(id, input),
    onSuccess: () => invalidateMaterias(),
  });

  const eliminarMateriaMutation = useMutation({
    mutationFn: (id: string) => eliminarMateria(id),
    onSuccess: () => {
      invalidateMaterias();
      // Eliminar una materia afecta TPs y Laboratorios
      invalidateTps();
      invalidateLaboratorios();
    },
  });

  // ── TRABAJOS PRÁCTICOS ────────────────────────────────────────────────────
  const crearTpMutation = useMutation({
    mutationFn: (input: CrearTrabajoPracticoInput) => crearTrabajoPractico(input),
    onSuccess: () => invalidateTps(),
  });

  const actualizarTpMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CrearTrabajoPracticoInput> }) =>
      actualizarTrabajoPractico(id, input),
    onSuccess: () => invalidateTps(),
  });

  const cambiarEstadoTpMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoTP }) =>
      cambiarEstadoTP(id, estado, userId),
    onSuccess: () => invalidateTps(),
  });

  const eliminarTpMutation = useMutation({
    mutationFn: (id: string) => eliminarTrabajoPractico(id),
    onSuccess: () => invalidateTps(),
  });

  // ── LABORATORIOS ──────────────────────────────────────────────────────────
  const crearLaboratorioMutation = useMutation({
    mutationFn: (input: CrearLaboratorioInput) => crearLaboratorio(input),
    onSuccess: () => invalidateLaboratorios(),
  });

  const actualizarLaboratorioMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CrearLaboratorioInput> }) =>
      actualizarLaboratorio(id, input),
    onSuccess: () => invalidateLaboratorios(),
  });

  const cambiarEstadoLaboratorioMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoLaboratorio }) =>
      cambiarEstadoLaboratorio(id, estado, userId),
    onSuccess: () => invalidateLaboratorios(),
  });

  const eliminarLaboratorioMutation = useMutation({
    mutationFn: (id: string) => eliminarLaboratorio(id),
    onSuccess: () => invalidateLaboratorios(),
  });

  const toggleTareaMutation = useMutation({
    mutationFn: ({ laboratorioId, tareaId }: { laboratorioId: string; tareaId: string }) =>
      toggleTareaLaboratorio(laboratorioId, tareaId, userId),
    onSuccess: () => invalidateLaboratorios(),
  });

  return {
    // Materias
    crearMateria: crearMateriaMutation,
    actualizarMateria: actualizarMateriaMutation,
    eliminarMateria: eliminarMateriaMutation,
    // TPs
    crearTp: crearTpMutation,
    actualizarTp: actualizarTpMutation,
    cambiarEstadoTp: cambiarEstadoTpMutation,
    eliminarTp: eliminarTpMutation,
    // Laboratorios
    crearLaboratorio: crearLaboratorioMutation,
    actualizarLaboratorio: actualizarLaboratorioMutation,
    cambiarEstadoLaboratorio: cambiarEstadoLaboratorioMutation,
    eliminarLaboratorio: eliminarLaboratorioMutation,
    toggleTarea: toggleTareaMutation,
  };
}
