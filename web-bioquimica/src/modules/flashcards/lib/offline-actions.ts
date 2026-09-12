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
import { createClient } from "@/core/lib/supabase/client";
import { isSupabaseConfigured } from "@/core/lib/supabase/utils";
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
  if (isOnline() && isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      let query = supabase.from("tarjetas_estudio").select("*, materias(nombre)");
      if (estudianteId) {
        query = query.eq("estudiante_id", estudianteId);
      }
      const { data, error } = await query.order("created_at", { ascending: false });

      if (!error && data) {
        const formatted = data.map((item: any) => ({
          ...item,
          materia_nombre: item.materias?.nombre || "Bioquímica General",
        }));
        if (formatted.length > 0) {
          await idbPutTarjetas(formatted as TarjetaEstudio[]);
        }
        return { success: true, data: formatted as TarjetaEstudio[] };
      }
    } catch {
      // fallback IDB
    }
  }
  const data = await idbGetTarjetas(estudianteId);
  if (data.length === 0 && !isSupabaseConfigured()) {
    return remoteActions.getTarjetasEstudio(estudianteId);
  }
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
    sm2_intervalo: 0,
    sm2_facilidad: 2.5,
    sm2_repeticiones: 0,
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
      sm2_intervalo: 0,
      sm2_facilidad: 2.5,
      sm2_repeticiones: 0,
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
  calidad: number
): Promise<{ success: boolean; data?: TarjetaEstudio; error?: string }> {
  if (isOnline()) {
    try {
    const result = await remoteActions.registrarRespuestaFlashcard(id, calidad);
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

  if (calidad >= 3) {
    if (card.sm2_repeticiones === 0) card.sm2_intervalo = 1;
    else if (card.sm2_repeticiones === 1) card.sm2_intervalo = 6;
    else card.sm2_intervalo = Math.round((card.sm2_intervalo || 1) * (card.sm2_facilidad || 2.5));
    card.sm2_repeticiones = (card.sm2_repeticiones || 0) + 1;
  } else {
    card.sm2_repeticiones = 0;
    card.sm2_intervalo = 1;
  }

  let facilidad = card.sm2_facilidad || 2.5;
  facilidad = facilidad + (0.1 - (5 - calidad) * (0.08 + (5 - calidad) * 0.02));
  if (facilidad < 1.3) facilidad = 1.3;
  card.sm2_facilidad = facilidad;

  if (calidad >= 3) {
    card.repasos_correctos += 1;
    card.estado_repaso = card.sm2_repeticiones >= 3 ? "dominado" : "repasando";
  } else {
    card.repasos_correctos = 0;
    card.estado_repaso = "repasando";
  }

  const pRepaso = new Date();
  pRepaso.setDate(pRepaso.getDate() + card.sm2_intervalo);
  card.proximo_repaso = pRepaso.toISOString().split("T")[0];
  card.updated_at = now();

  await idbPutTarjeta(card);
  await syncQueueAdd({
    table: "tarjetas_estudio",
    operation: "update",
    entityId: id,
    payload: { 
      repasos_correctos: card.repasos_correctos, 
      estado_repaso: card.estado_repaso,
      sm2_intervalo: card.sm2_intervalo,
      sm2_facilidad: card.sm2_facilidad,
      sm2_repeticiones: card.sm2_repeticiones,
      proximo_repaso: card.proximo_repaso
    },
  });
  await syncManager.refreshPendingCount();
  return { success: true, data: card };
}
