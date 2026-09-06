/**
 * sync-manager.ts
 * Singleton que gestiona la sincronización offline → Supabase.
 *
 * Flujo:
 * 1. Escucha el evento `window.online`.
 * 2. Al reconectar, lee la sync_queue de IndexedDB en orden FIFO.
 * 3. Ejecuta la operación correspondiente contra Supabase.
 * 4. Si tiene éxito, elimina la entrada de la cola.
 * 5. Si falla, incrementa retries. Si supera MAX_RETRIES, descarta.
 * 6. Al terminar, emite un CustomEvent para que los hooks de React Query invaliden.
 */

import {
  syncQueueGetAll,
  syncQueueDelete,
  syncQueueUpdateRetries,
  syncQueueCount,
  idbPutMateria,
  idbPutTp,
  idbPutLaboratorio,
  idbPutTarjeta,
  type SyncOperation,
  type SyncTable,
} from "./indexed-db";

import { createClient } from "./supabase/client";
import { isSupabaseConfigured } from "./supabase/utils";

const MAX_RETRIES = 3;

export type SyncManagerState = {
  isSyncing: boolean;
  pendingCount: number;
  lastSyncAt: string | null;
  lastError: string | null;
};

type SyncStateListener = (state: SyncManagerState) => void;

class SyncManager {
  private state: SyncManagerState = {
    isSyncing: false,
    pendingCount: 0,
    lastSyncAt: null,
    lastError: null,
  };

  private listeners: Set<SyncStateListener> = new Set();
  private initialized = false;
  // Referencia a queryClient — se inyecta en tiempo de ejecución
  private queryClientRef: { invalidateQueries: (opts: any) => Promise<void> } | null = null;

  init() {
    if (this.initialized || typeof window === "undefined") return;
    this.initialized = true;

    window.addEventListener("online", this.handleOnline);

    // Actualizar el count inicial
    this.refreshPendingCount();
  }

  destroy() {
    if (typeof window === "undefined") return;
    window.removeEventListener("online", this.handleOnline);
  }

  setQueryClient(qc: { invalidateQueries: (opts: any) => Promise<void> }) {
    this.queryClientRef = qc;
  }

  subscribe(listener: SyncStateListener): () => void {
    this.listeners.add(listener);
    listener(this.state); // emite estado actual al suscribirse
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.state }));
  }

  private setState(patch: Partial<SyncManagerState>) {
    this.state = { ...this.state, ...patch };
    this.notify();
  }

  async refreshPendingCount() {
    if (typeof window === "undefined") return;
    try {
      const count = await syncQueueCount();
      this.setState({ pendingCount: count });
    } catch {
      // Si IndexedDB aún no está disponible, ignorar
    }
  }

  private handleOnline = () => {
    this.processSyncQueue();
  };

  /** Forzar sync manual (útil para retry UI) */
  async forceSync() {
    if (navigator.onLine) {
      await this.processSyncQueue();
    }
  }

  private async processSyncQueue() {
    if (this.state.isSyncing) return;

    const queue = await syncQueueGetAll();
    if (queue.length === 0) {
      this.setState({ pendingCount: 0 });
      return;
    }

    this.setState({ isSyncing: true, lastError: null });


    if (!isSupabaseConfigured()) {
      this.setState({ isSyncing: false });
      return;
    }

    const supabase = createClient();
    let successCount = 0;

    for (const op of queue) {
      try {
        await this.executeOperation(op, supabase);
        await syncQueueDelete(op.id);
        successCount++;
      } catch (err: any) {
        const newRetries = op.retries + 1;
        if (newRetries >= MAX_RETRIES) {
          console.warn(`[SyncManager] Descartando operación ${op.id} tras ${MAX_RETRIES} intentos.`, err);
          await syncQueueDelete(op.id);
        } else {
          await syncQueueUpdateRetries(op.id, newRetries);
          this.setState({ lastError: err?.message || "Error de sincronización" });
        }
      }
    }

    const remainingCount = await syncQueueCount();
    this.setState({
      isSyncing: false,
      pendingCount: remainingCount,
      lastSyncAt: successCount > 0 ? new Date().toISOString() : this.state.lastSyncAt,
    });

    // Invalidar queries de React Query si hay queryClient registrado
    if (successCount > 0 && this.queryClientRef) {
      await this.queryClientRef.invalidateQueries({ queryKey: ["academico"] });
      await this.queryClientRef.invalidateQueries({ queryKey: ["flashcards"] });
    }
  }

  private async executeOperation(op: SyncOperation, supabase: any) {
    const { table, operation, payload, entityId } = op;

    switch (operation) {
      case "create": {
        const p = payload as Record<string, unknown>;
        // Si el ID es temporal (offline_xxx), no lo enviamos a Supabase
        const insertPayload = { ...p };
        delete insertPayload.id; // Supabase genera el ID real
        delete insertPayload.tareas; // relación anidada — se maneja aparte
        delete insertPayload.materia_nombre; // campo virtual
        delete insertPayload.tareasIniciales; // array temporal

        const { data, error } = await supabase.from(table).insert(insertPayload).select().single();
        if (error) throw error;

        // Actualizar IndexedDB: reemplazar ID temporal → ID real
        if (data) {
          await this.replaceOfflineId(table, entityId, data);
        }
        break;
      }

      case "update": {
        const p = payload as Record<string, unknown>;
        const updatePayload = { ...p };
        delete updatePayload.id;
        delete updatePayload.tareas;
        delete updatePayload.materia_nombre;
        delete updatePayload.tareasIniciales;

        const { error } = await supabase.from(table).update(updatePayload).eq("id", entityId);
        if (error) throw error;
        break;
      }

      case "delete": {
        // Si es un ID temporal, ya no existe en Supabase → solo limpiar queue
        if (entityId.startsWith("offline_")) break;
        const { error } = await supabase.from(table).delete().eq("id", entityId);
        if (error) throw error;
        break;
      }

      case "toggle_tarea": {
        const { tareaId, completada } = payload as { tareaId: string; completada: boolean };
        if (tareaId.startsWith("offline_")) break;
        const { error } = await supabase
          .from("tareas_laboratorio")
          .update({ completada })
          .eq("id", tareaId);
        if (error) throw error;
        break;
      }

      case "cambiar_estado": {
        const { estado } = payload as { estado: string };
        if (entityId.startsWith("offline_")) break;
        const { error } = await supabase.from(table).update({ estado }).eq("id", entityId);
        if (error) throw error;
        break;
      }
    }
  }

  /**
   * Cuando Supabase asigna un ID real, actualizamos IndexedDB
   * para reemplazar el ID temporal con el real.
   */
  private async replaceOfflineId(table: SyncTable, offlineId: string, serverData: any) {
    if (!offlineId.startsWith("offline_")) return;

    switch (table) {
      case "materias": {
        const { idbDeleteMateria } = await import("./indexed-db");
        await idbDeleteMateria(offlineId);
        await idbPutMateria(serverData);
        break;
      }
      case "trabajos_practicos": {
        const { idbDeleteTp } = await import("./indexed-db");
        await idbDeleteTp(offlineId);
        await idbPutTp(serverData);
        break;
      }
      case "laboratorios": {
        const { idbDeleteLaboratorio } = await import("./indexed-db");
        await idbDeleteLaboratorio(offlineId);
        await idbPutLaboratorio({ ...serverData, tareas: serverData.tareas ?? [] });
        break;
      }
      case "tarjetas_estudio": {
        const { idbDeleteTarjeta } = await import("./indexed-db");
        await idbDeleteTarjeta(offlineId);
        await idbPutTarjeta(serverData);
        break;
      }
    }
  }
}

// Singleton
export const syncManager = new SyncManager();
