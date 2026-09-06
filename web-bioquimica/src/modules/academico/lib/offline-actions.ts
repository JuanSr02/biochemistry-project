/**
 * offline-actions.ts (Módulo Académico)
 *
 * Capa intermedia offline-aware. Todas las operaciones CRUD del módulo
 * académico deben pasar por aquí en lugar de llamar directamente a las
 * server actions de Supabase.
 *
 * Estrategia:
 * - GET: intenta Supabase → si falla o está offline, sirve desde IndexedDB.
 *        Cuando Supabase responde OK, persiste los datos frescos en IndexedDB.
 * - CREATE/UPDATE/DELETE: si online → Supabase + sync IndexedDB.
 *                         si offline → solo IndexedDB + encolar en sync_queue.
 */

import {
  idbGetMaterias,
  idbPutMaterias,
  idbPutMateria,
  idbDeleteMateria,
  idbGetTps,
  idbPutTps,
  idbPutTp,
  idbDeleteTp,
  idbGetLaboratorios,
  idbPutLaboratorios,
  idbPutLaboratorio,
  idbDeleteLaboratorio,
  syncQueueAdd,
  generateOfflineId,
} from "@/core/lib/indexed-db";
import { syncManager } from "@/core/lib/sync-manager";
import { createClient } from "@/core/lib/supabase/client";
import { isSupabaseConfigured } from "@/core/lib/supabase/utils";
import type {
  Materia,
  TrabajoPractico,
  Laboratorio,
  CrearMateriaInput,
  CrearTrabajoPracticoInput,
  CrearLaboratorioInput,
  EstadoTP,
  EstadoLaboratorio,
} from "../types";
import * as remoteActions from "../actions";

// ─── Utilidades ───────────────────────────────────────────────────────────────

function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

function now(): string {
  return new Date().toISOString();
}

// ══════════════════════════════════════════════════════════════════════════════
// MATERIAS
// ══════════════════════════════════════════════════════════════════════════════

export async function offlineGetMaterias(
  estudianteId?: string
): Promise<{ success: boolean; data: Materia[]; error?: string }> {
  if (isOnline() && isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      let query = supabase.from("materias").select("*");
      if (estudianteId) {
        query = query.eq("estudiante_id", estudianteId);
      }
      const { data, error } = await query.order("created_at", { ascending: false });

      if (!error && data) {
        if (data.length > 0) {
          await idbPutMaterias(data as Materia[]);
        }
        return { success: true, data: data as Materia[] };
      }
    } catch {
      // Caer en IDB si la red o Supabase falla
    }
  }
  const data = await idbGetMaterias(estudianteId);
  if (data.length === 0 && !isSupabaseConfigured()) {
    return remoteActions.getMaterias(estudianteId);
  }
  return { success: true, data };
}

export async function offlineCrearMateria(
  input: CrearMateriaInput
): Promise<{ success: boolean; data?: Materia; error?: string }> {
  if (!input.nombre.trim() || !input.codigo.trim()) {
    return { success: false, error: "El nombre y código de materia son obligatorios." };
  }

  if (isOnline()) {
    try {
    const result = await remoteActions.crearMateria(input);
    if (result.success && result.data) {
      await idbPutMateria(result.data);
      await syncManager.refreshPendingCount();
    }
    return result;
    } catch (e) {
      // Fallback a modo offline
    }
  }

  // Modo offline: crear localmente
  const offlineId = generateOfflineId();
  const nuevaMateria: Materia = {
    id: offlineId,
    nombre: input.nombre.trim(),
    codigo: input.codigo.trim(),
    profesor: input.profesor?.trim() || undefined,
    cuatrimestre: input.cuatrimestre.trim() || "1º Cuatrimestre",
    estado: input.estado,
    estudiante_id: input.estudiante_id,
    created_at: now(),
    created_by: input.estudiante_id || offlineId,
    updated_at: now(),
    updated_by: input.estudiante_id || offlineId,
  };

  await idbPutMateria(nuevaMateria);
  await syncQueueAdd({
    table: "materias",
    operation: "create",
    entityId: offlineId,
    payload: { ...nuevaMateria },
  });
  await syncManager.refreshPendingCount();
  return { success: true, data: nuevaMateria };
}

export async function offlineActualizarMateria(
  id: string,
  input: Partial<CrearMateriaInput>
): Promise<{ success: boolean; data?: Materia; error?: string }> {
  if (isOnline()) {
    try {
    const result = await remoteActions.actualizarMateria(id, input);
    if (result.success && result.data) {
      await idbPutMateria(result.data);
    }
    return result;
    } catch (e) {
      // Fallback a modo offline
    }
  }

  // Modo offline: actualizar en IDB y encolar
  const all = await idbGetMaterias();
  const existing = all.find((m) => m.id === id);
  if (!existing) return { success: false, error: "Materia no encontrada en caché local." };

  const updated: Materia = { ...existing, ...input, updated_at: now() };
  await idbPutMateria(updated);
  await syncQueueAdd({ table: "materias", operation: "update", entityId: id, payload: input });
  await syncManager.refreshPendingCount();
  return { success: true, data: updated };
}

export async function offlineEliminarMateria(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (isOnline()) {
    try {
    const result = await remoteActions.eliminarMateria(id);
    if (result.success) await idbDeleteMateria(id);
    return result;
    } catch (e) {
      // Fallback a modo offline
    }
  }

  await idbDeleteMateria(id);
  if (!id.startsWith("offline_")) {
    await syncQueueAdd({ table: "materias", operation: "delete", entityId: id, payload: {} });
    await syncManager.refreshPendingCount();
  }
  return { success: true };
}

// ══════════════════════════════════════════════════════════════════════════════
// TRABAJOS PRÁCTICOS
// ══════════════════════════════════════════════════════════════════════════════

export async function offlineGetTps(
  estudianteId?: string
): Promise<{ success: boolean; data: TrabajoPractico[]; error?: string }> {
  if (isOnline() && isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      let query = supabase.from("trabajos_practicos").select("*, materias(nombre)");
      if (estudianteId) {
        query = query.eq("estudiante_id", estudianteId);
      }
      const { data, error } = await query.order("fecha_entrega", { ascending: true });

      if (!error && data) {
        const formatted = data.map((item: any) => ({
          ...item,
          materia_nombre: item.materias?.nombre || "General",
        }));
        if (formatted.length > 0) {
          await idbPutTps(formatted as TrabajoPractico[]);
        }
        return { success: true, data: formatted as TrabajoPractico[] };
      }
    } catch {
      // fallback IDB
    }
  }
  const data = await idbGetTps(estudianteId);
  if (data.length === 0 && !isSupabaseConfigured()) {
    return remoteActions.getTrabajosPracticos(estudianteId);
  }
  return { success: true, data };
}

export async function offlineCrearTp(
  input: CrearTrabajoPracticoInput
): Promise<{ success: boolean; data?: TrabajoPractico; error?: string }> {
  if (!input.titulo.trim() || !input.fecha_entrega) {
    return { success: false, error: "El título y la fecha de entrega son obligatorios." };
  }

  if (isOnline()) {
    try {
    const result = await remoteActions.crearTrabajoPractico(input);
    if (result.success && result.data) {
      await idbPutTp(result.data);
    }
    return result;
    } catch (e) {
      // Fallback a modo offline
    }
  }

  const offlineId = generateOfflineId();
  // Buscar nombre de materia en caché local
  const materias = await idbGetMaterias();
  const materia = materias.find((m) => m.id === input.materia_id);

  const nuevoTp: TrabajoPractico = {
    id: offlineId,
    materia_id: input.materia_id,
    materia_nombre: materia?.nombre || "General",
    titulo: input.titulo.trim(),
    descripcion: input.descripcion?.trim() || undefined,
    fecha_entrega: input.fecha_entrega,
    estado: input.estado,
    calificacion: input.calificacion,
    estudiante_id: input.estudiante_id,
    created_at: now(),
    created_by: input.estudiante_id || offlineId,
    updated_at: now(),
    updated_by: input.estudiante_id || offlineId,
  };

  await idbPutTp(nuevoTp);
  await syncQueueAdd({ table: "trabajos_practicos", operation: "create", entityId: offlineId, payload: { ...nuevoTp } });
  await syncManager.refreshPendingCount();
  return { success: true, data: nuevoTp };
}

export async function offlineActualizarTp(
  id: string,
  input: Partial<CrearTrabajoPracticoInput>
): Promise<{ success: boolean; data?: TrabajoPractico; error?: string }> {
  if (isOnline()) {
    try {
    const result = await remoteActions.actualizarTrabajoPractico(id, input);
    if (result.success && result.data) await idbPutTp(result.data);
    return result;
    } catch (e) {
      // Fallback a modo offline
    }
  }

  const all = await idbGetTps();
  const existing = all.find((t) => t.id === id);
  if (!existing) return { success: false, error: "TP no encontrado en caché local." };

  const updated: TrabajoPractico = { ...existing, ...input, updated_at: now() };
  await idbPutTp(updated);
  await syncQueueAdd({ table: "trabajos_practicos", operation: "update", entityId: id, payload: input });
  await syncManager.refreshPendingCount();
  return { success: true, data: updated };
}

export async function offlineCambiarEstadoTp(
  id: string,
  nuevoEstado: EstadoTP,
  estudianteId?: string
): Promise<{ success: boolean; error?: string }> {
  if (isOnline()) {
    try {
    return remoteActions.cambiarEstadoTP(id, nuevoEstado, estudianteId);
    } catch (e) {
      // Fallback a modo offline
    }
  }

  const all = await idbGetTps();
  const tp = all.find((t) => t.id === id);
  if (tp) {
    tp.estado = nuevoEstado;
    tp.updated_at = now();
    await idbPutTp(tp);
  }
  await syncQueueAdd({ table: "trabajos_practicos", operation: "cambiar_estado", entityId: id, payload: { estado: nuevoEstado } });
  await syncManager.refreshPendingCount();
  return { success: true };
}

export async function offlineEliminarTp(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (isOnline()) {
    try {
    const result = await remoteActions.eliminarTrabajoPractico(id);
    if (result.success) await idbDeleteTp(id);
    return result;
    } catch (e) {
      // Fallback a modo offline
    }
  }

  await idbDeleteTp(id);
  if (!id.startsWith("offline_")) {
    await syncQueueAdd({ table: "trabajos_practicos", operation: "delete", entityId: id, payload: {} });
    await syncManager.refreshPendingCount();
  }
  return { success: true };
}

// ══════════════════════════════════════════════════════════════════════════════
// LABORATORIOS
// ══════════════════════════════════════════════════════════════════════════════

export async function offlineGetLaboratorios(
  estudianteId?: string
): Promise<{ success: boolean; data: Laboratorio[]; error?: string }> {
  if (isOnline() && isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      let query = supabase.from("laboratorios").select("*, materias(nombre), tareas_laboratorio(*)");
      if (estudianteId) {
        query = query.eq("estudiante_id", estudianteId);
      }
      const { data, error } = await query.order("fecha", { ascending: true });

      if (!error && data) {
        const formatted = data.map((lab: any) => ({
          ...lab,
          materia_nombre: lab.materias?.nombre || "Bioquímica General",
          tareas: (lab.tareas_laboratorio || []).sort((a: any, b: any) => a.orden - b.orden),
        }));
        if (formatted.length > 0) {
          await idbPutLaboratorios(formatted as Laboratorio[]);
        }
        return { success: true, data: formatted as Laboratorio[] };
      }
    } catch {
      // fallback IDB
    }
  }
  const data = await idbGetLaboratorios(estudianteId);
  if (data.length === 0 && !isSupabaseConfigured()) {
    return remoteActions.getLaboratorios(estudianteId);
  }
  return { success: true, data };
}

export async function offlineCrearLaboratorio(
  input: CrearLaboratorioInput
): Promise<{ success: boolean; data?: Laboratorio; error?: string }> {
  if (!input.titulo.trim() || !input.fecha) {
    return { success: false, error: "El título y fecha de la sesión son obligatorios." };
  }

  if (isOnline()) {
    try {
    const result = await remoteActions.crearLaboratorio(input);
    if (result.success && result.data) await idbPutLaboratorio(result.data);
    return result;
    } catch (e) {
      // Fallback a modo offline
    }
  }

  const offlineId = generateOfflineId();
  const materias = await idbGetMaterias();
  const materia = materias.find((m) => m.id === input.materia_id);

  const tareas = input.tareasIniciales
    .filter((t) => t.trim().length > 0)
    .map((desc, idx) => ({
      id: generateOfflineId(),
      laboratorio_id: offlineId,
      descripcion: desc.trim(),
      completada: false,
      orden: idx + 1,
      created_at: now(),
      created_by: input.estudiante_id || offlineId,
      updated_at: now(),
      updated_by: input.estudiante_id || offlineId,
    }));

  const nuevoLab: Laboratorio = {
    id: offlineId,
    materia_id: input.materia_id,
    materia_nombre: materia?.nombre || "Bioquímica General",
    titulo: input.titulo.trim(),
    fecha: input.fecha,
    observaciones: input.observaciones?.trim() || undefined,
    estado: "pendiente",
    tareas,
    estudiante_id: input.estudiante_id,
    created_at: now(),
    created_by: input.estudiante_id || offlineId,
    updated_at: now(),
    updated_by: input.estudiante_id || offlineId,
  };

  await idbPutLaboratorio(nuevoLab);
  await syncQueueAdd({
    table: "laboratorios",
    operation: "create",
    entityId: offlineId,
    payload: { ...nuevoLab, tareasIniciales: input.tareasIniciales },
  });
  await syncManager.refreshPendingCount();
  return { success: true, data: nuevoLab };
}

export async function offlineActualizarLaboratorio(
  id: string,
  input: Partial<CrearLaboratorioInput>
): Promise<{ success: boolean; data?: Laboratorio; error?: string }> {
  if (isOnline()) {
    try {
    const result = await remoteActions.actualizarLaboratorio(id, input);
    if (result.success && result.data) await idbPutLaboratorio(result.data);
    return result;
    } catch (e) {
      // Fallback a modo offline
    }
  }

  const all = await idbGetLaboratorios();
  const existing = all.find((l) => l.id === id);
  if (!existing) return { success: false, error: "Laboratorio no encontrado en caché local." };

  const updated: Laboratorio = { ...existing, ...input, updated_at: now() };
  await idbPutLaboratorio(updated);
  await syncQueueAdd({ table: "laboratorios", operation: "update", entityId: id, payload: input });
  await syncManager.refreshPendingCount();
  return { success: true, data: updated };
}

export async function offlineCambiarEstadoLaboratorio(
  id: string,
  nuevoEstado: EstadoLaboratorio,
  estudianteId?: string
): Promise<{ success: boolean; error?: string }> {
  if (isOnline()) {
    try {
    return remoteActions.cambiarEstadoLaboratorio(id, nuevoEstado, estudianteId);
    } catch (e) {
      // Fallback a modo offline
    }
  }

  const all = await idbGetLaboratorios();
  const lab = all.find((l) => l.id === id);
  if (lab) {
    lab.estado = nuevoEstado;
    lab.updated_at = now();
    await idbPutLaboratorio(lab);
  }
  await syncQueueAdd({ table: "laboratorios", operation: "cambiar_estado", entityId: id, payload: { estado: nuevoEstado } });
  await syncManager.refreshPendingCount();
  return { success: true };
}

export async function offlineToggleTarea(
  laboratorioId: string,
  tareaId: string,
  estudianteId?: string
): Promise<{ success: boolean; error?: string }> {
  if (isOnline()) {
    try {
    return remoteActions.toggleTareaLaboratorio(laboratorioId, tareaId, estudianteId);
    } catch (e) {
      // Fallback a modo offline
    }
  }

  const all = await idbGetLaboratorios();
  const lab = all.find((l) => l.id === laboratorioId);
  if (lab) {
    const tarea = lab.tareas.find((t) => t.id === tareaId);
    if (tarea) {
      tarea.completada = !tarea.completada;
      tarea.updated_at = now();
      const total = lab.tareas.length;
      const completadas = lab.tareas.filter((t) => t.completada).length;
      lab.estado = completadas === total && total > 0 ? "completado" : completadas > 0 ? "en_progreso" : "pendiente";
      await idbPutLaboratorio(lab);
    }
    await syncQueueAdd({
      table: "laboratorios",
      operation: "toggle_tarea",
      entityId: laboratorioId,
      payload: { tareaId, completada: lab.tareas.find((t) => t.id === tareaId)?.completada },
    });
    await syncManager.refreshPendingCount();
  }
  return { success: true };
}

export async function offlineEliminarLaboratorio(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (isOnline()) {
    try {
    const result = await remoteActions.eliminarLaboratorio(id);
    if (result.success) await idbDeleteLaboratorio(id);
    return result;
    } catch (e) {
      // Fallback a modo offline
    }
  }

  await idbDeleteLaboratorio(id);
  if (!id.startsWith("offline_")) {
    await syncQueueAdd({ table: "laboratorios", operation: "delete", entityId: id, payload: {} });
    await syncManager.refreshPendingCount();
  }
  return { success: true };
}
