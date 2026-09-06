/**
 * indexed-db.ts
 * Wrapper sobre `idb` para la persistencia local offline.
 * Define los object stores para materias, TPs, laboratorios,
 * tarjetas de estudio y la cola de sincronización.
 */

import { openDB, DBSchema, IDBPDatabase } from "idb";
import type { Materia, TrabajoPractico, Laboratorio } from "@/modules/academico/types";
import type { TarjetaEstudio } from "@/modules/flashcards/types";

// ─── Schema ───────────────────────────────────────────────────────────────────

export type SyncOperationType =
  | "create"
  | "update"
  | "delete"
  | "toggle_tarea"
  | "cambiar_estado";

export type SyncTable =
  | "materias"
  | "trabajos_practicos"
  | "laboratorios"
  | "tarjetas_estudio";

export interface SyncOperation {
  id: string;
  table: SyncTable;
  operation: SyncOperationType;
  payload: unknown;
  /** ID temporal "offline_xxx" o ID real si ya se conocía al encolar */
  entityId: string;
  createdAt: string;
  retries: number;
}

interface BioToolsDB extends DBSchema {
  materias: {
    key: string;
    value: Materia;
    indexes: { by_estudiante: string };
  };
  trabajos_practicos: {
    key: string;
    value: TrabajoPractico;
    indexes: { by_estudiante: string };
  };
  laboratorios: {
    key: string;
    value: Laboratorio;
    indexes: { by_estudiante: string };
  };
  tarjetas_estudio: {
    key: string;
    value: TarjetaEstudio;
    indexes: { by_estudiante: string };
  };
  sync_queue: {
    key: string;
    value: SyncOperation;
    indexes: { by_created: string };
  };
}

// ─── DB version & migration ───────────────────────────────────────────────────

const DB_NAME = "biotools-offline";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<BioToolsDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<BioToolsDB>> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB no disponible en servidor"));
  }
  if (!dbPromise) {
    dbPromise = openDB<BioToolsDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Materias
        if (!db.objectStoreNames.contains("materias")) {
          const s = db.createObjectStore("materias", { keyPath: "id" });
          s.createIndex("by_estudiante", "estudiante_id");
        }
        // TPs
        if (!db.objectStoreNames.contains("trabajos_practicos")) {
          const s = db.createObjectStore("trabajos_practicos", { keyPath: "id" });
          s.createIndex("by_estudiante", "estudiante_id");
        }
        // Laboratorios
        if (!db.objectStoreNames.contains("laboratorios")) {
          const s = db.createObjectStore("laboratorios", { keyPath: "id" });
          s.createIndex("by_estudiante", "estudiante_id");
        }
        // Tarjetas de estudio (Flashcards)
        if (!db.objectStoreNames.contains("tarjetas_estudio")) {
          const s = db.createObjectStore("tarjetas_estudio", { keyPath: "id" });
          s.createIndex("by_estudiante", "estudiante_id");
        }
        // Cola de sincronización
        if (!db.objectStoreNames.contains("sync_queue")) {
          const s = db.createObjectStore("sync_queue", { keyPath: "id" });
          s.createIndex("by_created", "createdAt");
        }
      },
    });
  }
  return dbPromise;
}

// ─── Helpers genéricos ────────────────────────────────────────────────────────

/** Genera un ID local con prefijo offline */
export function generateOfflineId(): string {
  return `offline_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Materias ─────────────────────────────────────────────────────────────────

export async function idbGetMaterias(estudianteId?: string): Promise<Materia[]> {
  const db = await getDB();
  if (estudianteId) {
    return db.getAllFromIndex("materias", "by_estudiante", estudianteId);
  }
  return db.getAll("materias");
}

export async function idbPutMaterias(items: Materia[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("materias", "readwrite");
  await Promise.all(items.map((m) => tx.store.put(m)));
  await tx.done;
}

export async function idbPutMateria(item: Materia): Promise<void> {
  const db = await getDB();
  await db.put("materias", item);
}

export async function idbDeleteMateria(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("materias", id);
}

// ─── Trabajos Prácticos ───────────────────────────────────────────────────────

export async function idbGetTps(estudianteId?: string): Promise<TrabajoPractico[]> {
  const db = await getDB();
  if (estudianteId) {
    return db.getAllFromIndex("trabajos_practicos", "by_estudiante", estudianteId);
  }
  return db.getAll("trabajos_practicos");
}

export async function idbPutTps(items: TrabajoPractico[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("trabajos_practicos", "readwrite");
  await Promise.all(items.map((t) => tx.store.put(t)));
  await tx.done;
}

export async function idbPutTp(item: TrabajoPractico): Promise<void> {
  const db = await getDB();
  await db.put("trabajos_practicos", item);
}

export async function idbDeleteTp(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("trabajos_practicos", id);
}

// ─── Laboratorios ─────────────────────────────────────────────────────────────

export async function idbGetLaboratorios(estudianteId?: string): Promise<Laboratorio[]> {
  const db = await getDB();
  if (estudianteId) {
    return db.getAllFromIndex("laboratorios", "by_estudiante", estudianteId);
  }
  return db.getAll("laboratorios");
}

export async function idbPutLaboratorios(items: Laboratorio[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("laboratorios", "readwrite");
  await Promise.all(items.map((l) => tx.store.put(l)));
  await tx.done;
}

export async function idbPutLaboratorio(item: Laboratorio): Promise<void> {
  const db = await getDB();
  await db.put("laboratorios", item);
}

export async function idbDeleteLaboratorio(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("laboratorios", id);
}

// ─── Tarjetas Estudio (Flashcards) ────────────────────────────────────────────

export async function idbGetTarjetas(estudianteId?: string): Promise<TarjetaEstudio[]> {
  const db = await getDB();
  if (estudianteId) {
    return db.getAllFromIndex("tarjetas_estudio", "by_estudiante", estudianteId);
  }
  return db.getAll("tarjetas_estudio");
}

export async function idbPutTarjetas(items: TarjetaEstudio[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("tarjetas_estudio", "readwrite");
  await Promise.all(items.map((t) => tx.store.put(t)));
  await tx.done;
}

export async function idbPutTarjeta(item: TarjetaEstudio): Promise<void> {
  const db = await getDB();
  await db.put("tarjetas_estudio", item);
}

export async function idbDeleteTarjeta(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("tarjetas_estudio", id);
}

// ─── Sync Queue ───────────────────────────────────────────────────────────────

export async function syncQueueAdd(op: Omit<SyncOperation, "id" | "createdAt" | "retries">): Promise<SyncOperation> {
  const db = await getDB();
  const entry: SyncOperation = {
    ...op,
    id: generateOfflineId(),
    createdAt: new Date().toISOString(),
    retries: 0,
  };
  await db.put("sync_queue", entry);
  return entry;
}

export async function syncQueueGetAll(): Promise<SyncOperation[]> {
  const db = await getDB();
  return db.getAllFromIndex("sync_queue", "by_created");
}

export async function syncQueueCount(): Promise<number> {
  const db = await getDB();
  return db.count("sync_queue");
}

export async function syncQueueDelete(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("sync_queue", id);
}

export async function syncQueueUpdateRetries(id: string, retries: number): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("sync_queue", "readwrite");
  const op = await tx.store.get(id);
  if (op) {
    op.retries = retries;
    await tx.store.put(op);
  }
  await tx.done;
}
