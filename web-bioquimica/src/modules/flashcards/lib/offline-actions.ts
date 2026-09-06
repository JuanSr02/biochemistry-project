/**
 * offline-actions.ts (Módulo Flashcards)
 *
 * Capa intermedia offline-aware para el módulo de flashcards.
 * Mismo patrón que el módulo académico.
 */

import {
  idbGetTarjetas,
  idbPutTarjetas,
  idbPutTarjeta,
  idbDeleteTarjeta,
  syncQueueAdd,
  generateOfflineId,
} from "@/core/lib/indexed-db";
import { syncManager } from "@/core/lib/sync-manager";
import type { TarjetaEstudio, CrearFlashcardInput, ActualizarFlashcardInput } from "../types";
import * as remoteActions from "../actions";

// ─── Utilidades ───────────────────────────────────────────────────────────────

function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

function now(): string {
  return new Date().toISOString();
}

// ══════════════════════════════════════════════════════════════════════════════
// TARJETAS DE ESTUDIO
// ══════════════════════════════════════════════════════════════════════════════

export async function offlineGetTarjetas(
  estudianteId?: string
): Promise<{ success: boolean; data: TarjetaEstudio[] }> {
  if (isOnline()) {
    try {
      const result = await remoteActions.getTarjetasEstudio(estudianteId);
      if (result.success && result.data.length > 0) {
        await idbPutTarjetas(result.data);
      }
      return result;
    } catch {
      // fallback IDB
    }
  }
  const data = await idbGetTarjetas(estudianteId);
  return { success: true, data };
}

export async function offlineCrearFlashcard(
  input: CrearFlashcardInput
): Promise<{ success: boolean; data?: TarjetaEstudio; error?: string }> {
  if (!input.pregunta.trim() || !input.respuesta.trim() || !input.categoria.trim()) {
    return { success: false, error: "Pregunta, respuesta y categoría son obligatorios." };
  }

  if (isOnline()) {
    try {
    const result = await remoteActions.crearFlashcard(input);
    if (result.success && result.data) {
      await idbPutTarjeta(result.data);
    }
    return result;
    } catch (e) {
      // Fallback a modo offline
    }
  }

  const offlineId = generateOfflineId();
  const nuevaTarjeta: TarjetaEstudio = {
    id: offlineId,
    materia_id: input.materia_id,
    materia_nombre: "Bioquímica General",
    categoria: input.categoria.trim(),
    pregunta: input.pregunta.trim(),
    respuesta: input.respuesta.trim(),
    nivel_dificultad: input.nivel_dificultad,
    estado_repaso: "nuevo",
    repasos_correctos: 0,
    estudiante_id: input.estudiante_id,
    created_at: now(),
    created_by: input.estudiante_id || offlineId,
    updated_at: now(),
    updated_by: input.estudiante_id || offlineId,
  };

  await idbPutTarjeta(nuevaTarjeta);
  await syncQueueAdd({
    table: "tarjetas_estudio",
    operation: "create",
    entityId: offlineId,
    payload: {
      materia_id: input.materia_id || null,
      categoria: input.categoria.trim(),
      pregunta: input.pregunta.trim(),
      respuesta: input.respuesta.trim(),
      nivel_dificultad: input.nivel_dificultad,
      estado_repaso: "nuevo",
      repasos_correctos: 0,
      estudiante_id: input.estudiante_id,
      created_by: input.estudiante_id,
      updated_by: input.estudiante_id,
    },
  });
  await syncManager.refreshPendingCount();
  return { success: true, data: nuevaTarjeta };
}

export async function offlineActualizarFlashcard(
  id: string,
  input: ActualizarFlashcardInput
): Promise<{ success: boolean; data?: TarjetaEstudio; error?: string }> {
  if (isOnline()) {
    try {
    const result = await remoteActions.actualizarFlashcard(id, input);
    if (result.success && result.data) await idbPutTarjeta(result.data);
    return result;
    } catch (e) {
      // Fallback a modo offline
    }
  }

  const all = await idbGetTarjetas();
  const existing = all.find((c) => c.id === id);
  if (!existing) return { success: false, error: "Tarjeta no encontrada en caché local." };

  const updated: TarjetaEstudio = { ...existing, ...input, updated_at: now() };
  await idbPutTarjeta(updated);
  await syncQueueAdd({ table: "tarjetas_estudio", operation: "update", entityId: id, payload: input });
  await syncManager.refreshPendingCount();
  return { success: true, data: updated };
}

export async function offlineEliminarFlashcard(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (isOnline()) {
    try {
    const result = await remoteActions.eliminarFlashcard(id);
    if (result.success) await idbDeleteTarjeta(id);
    return result;
    } catch (e) {
      // Fallback a modo offline
    }
  }

  await idbDeleteTarjeta(id);
  if (!id.startsWith("offline_")) {
    await syncQueueAdd({ table: "tarjetas_estudio", operation: "delete", entityId: id, payload: {} });
    await syncManager.refreshPendingCount();
  }
  return { success: true };
}

export async function offlineRegistrarRespuesta(
  id: string,
  sabias: boolean
): Promise<{ success: boolean; data?: TarjetaEstudio; error?: string }> {
  if (isOnline()) {
    try {
    const result = await remoteActions.registrarRespuestaFlashcard(id, sabias);
    if (result.success && result.data) await idbPutTarjeta(result.data);
    return result;
    } catch (e) {
      // Fallback a modo offline
    }
  }

  // Modo offline: actualizar localmente y encolar
  const all = await idbGetTarjetas();
  const card = all.find((c) => c.id === id);
  if (!card) return { success: false, error: "Tarjeta no encontrada." };

  const nuevosRepasos = sabias ? card.repasos_correctos + 1 : 0;
  const nuevoEstado = sabias ? (nuevosRepasos >= 3 ? "dominado" : "repasando") : "repasando";

  const updated: TarjetaEstudio = {
    ...card,
    repasos_correctos: nuevosRepasos,
    estado_repaso: nuevoEstado,
    updated_at: now(),
  };

  await idbPutTarjeta(updated);
  await syncQueueAdd({
    table: "tarjetas_estudio",
    operation: "update",
    entityId: id,
    payload: { repasos_correctos: nuevosRepasos, estado_repaso: nuevoEstado },
  });
  await syncManager.refreshPendingCount();
  return { success: true, data: updated };
}
