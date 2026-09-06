/**
 * useSyncStatus.ts
 * Hook que expone el estado del SyncManager:
 * - pendingCount: número de operaciones en cola
 * - isSyncing: si está procesando la cola ahora mismo
 * - lastSyncAt: timestamp de la última sincronización exitosa
 * - lastError: último error de sincronización (si lo hay)
 * - forceSync: función para disparar sync manualmente
 */

"use client";

import { useEffect, useState } from "react";
import { syncManager, type SyncManagerState } from "@/core/lib/sync-manager";

export function useSyncStatus() {
  const [state, setState] = useState<SyncManagerState>({
    isSyncing: false,
    pendingCount: 0,
    lastSyncAt: null,
    lastError: null,
  });

  useEffect(() => {
    // Suscribirse al estado del singleton
    const unsubscribe = syncManager.subscribe((newState) => {
      setState(newState);
    });

    // Refrescar el count al montar
    syncManager.refreshPendingCount();

    return unsubscribe;
  }, []);

  return {
    ...state,
    forceSync: () => syncManager.forceSync(),
  };
}
