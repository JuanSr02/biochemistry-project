"use client";

import { useEffect, useRef, useState } from "react";
import { useOnlineStatus } from "@/core/hooks/useOnlineStatus";
import { useSyncStatus } from "@/core/hooks/useSyncStatus";
import { syncManager } from "@/core/lib/sync-manager";
import { getQueryClient } from "@/core/api/query-client";

/**
 * OfflineIndicator
 *
 * Banner animado que aparece en la parte inferior de la pantalla cuando el
 * estudiante está sin conexión. Muestra:
 *  - Estado actual (Offline / Sincronizando / Sincronizado)
 *  - Cantidad de cambios pendientes de sincronizar
 *  - Botón de reintentar sync manual
 *
 * Se monta en el layout raíz para estar disponible en toda la app.
 */
export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const { isSyncing, pendingCount, lastSyncAt, lastError, forceSync } = useSyncStatus();

  // Cuándo mostrar el banner "sincronizado" brevemente tras volver la conexión
  const [showSyncedBrief, setShowSyncedBrief] = useState(false);
  const syncedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mounted, setMounted] = useState(false);

  // Inicializar el SyncManager y registrar el queryClient
  useEffect(() => {
    setMounted(true);
    syncManager.init();
    const qc = getQueryClient();
    syncManager.setQueryClient(qc);
    return () => syncManager.destroy();
  }, []);

  // Cuando vuelve a estar online y termina de sincronizar → mostrar éxito brevemente
  useEffect(() => {
    if (isOnline && !isSyncing && lastSyncAt) {
      setShowSyncedBrief(true);
      syncedTimerRef.current = setTimeout(() => setShowSyncedBrief(false), 3000);
    }
    return () => {
      if (syncedTimerRef.current) clearTimeout(syncedTimerRef.current);
    };
  }, [isOnline, isSyncing, lastSyncAt]);

  const visible = !isOnline || isSyncing || showSyncedBrief || (isOnline && pendingCount > 0);

  if (!mounted || !visible) return null;

  // ── Estado ────────────────────────────────────────────────────────────────
  const isOffline = !isOnline;
  const isSyncingNow = isOnline && isSyncing;
  const justSynced = isOnline && showSyncedBrief && !isSyncing && pendingCount === 0;
  const hasPending = isOnline && pendingCount > 0 && !isSyncing;

  let bgColor = "var(--offline-bg, #1e293b)";
  let borderColor = "var(--offline-border, #334155)";
  let dotColor = "#94a3b8";
  let label = "";
  let sublabel = "";

  if (isOffline) {
    bgColor = "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)";
    borderColor = "#4338ca";
    dotColor = "#818cf8";
    label = "Sin conexión";
    sublabel =
      pendingCount > 0
        ? `${pendingCount} cambio${pendingCount !== 1 ? "s" : ""} pendiente${pendingCount !== 1 ? "s" : ""} de sincronizar`
        : "Los cambios se guardan localmente";
  } else if (isSyncingNow) {
    bgColor = "linear-gradient(135deg, #0c1a2e 0%, #0f2744 100%)";
    borderColor = "#1d4ed8";
    dotColor = "#60a5fa";
    label = "Sincronizando…";
    sublabel = `Enviando ${pendingCount} cambio${pendingCount !== 1 ? "s" : ""} al servidor`;
  } else if (justSynced) {
    bgColor = "linear-gradient(135deg, #052e16 0%, #064e3b 100%)";
    borderColor = "#059669";
    dotColor = "#34d399";
    label = "¡Todo sincronizado!";
    sublabel = "Tus datos están actualizados";
  } else if (hasPending) {
    bgColor = "linear-gradient(135deg, #1c1917 0%, #292524 100%)";
    borderColor = "#d97706";
    dotColor = "#fbbf24";
    label = "Cambios pendientes";
    sublabel = `${pendingCount} operacion${pendingCount !== 1 ? "es" : ""} en cola`;
  }

  return (
    <>
      <style>{`
        @keyframes offline-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes offline-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes offline-slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .offline-indicator {
          animation: offline-slide-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .offline-dot-pulse {
          animation: offline-pulse 1.5s ease-in-out infinite;
        }
        .offline-dot-spin {
          animation: offline-spin 1s linear infinite;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: #60a5fa;
          width: 8px;
          height: 8px;
        }
      `}</style>

      <div
        className="offline-indicator"
        style={{
          position: "fixed",
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 72px)",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          background: bgColor,
          border: `1px solid ${borderColor}`,
          borderRadius: "16px",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${borderColor}22`,
          backdropFilter: "blur(12px)",
          minWidth: "240px",
          maxWidth: "340px",
          fontFamily: "inherit",
        }}
        role="status"
        aria-live="polite"
      >
        {/* Indicador de estado (dot o spinner) */}
        {isSyncingNow ? (
          <div className="offline-dot-spin" />
        ) : (
          <div
            className={isOffline ? "offline-dot-pulse" : ""}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: dotColor,
              flexShrink: 0,
            }}
          />
        )}

        {/* Texto */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              fontWeight: 600,
              color: "#f1f5f9",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {label}
          </p>
          {sublabel && (
            <p
              style={{
                margin: 0,
                fontSize: "11px",
                color: "#94a3b8",
                lineHeight: 1.3,
                marginTop: "2px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {sublabel}
            </p>
          )}
          {lastError && isOffline && (
            <p style={{ margin: 0, fontSize: "10px", color: "#f87171", marginTop: "2px" }}>
              {lastError}
            </p>
          )}
        </div>

        {/* Botón reintentar (solo cuando hay pendientes y está online) */}
        {hasPending && (
          <button
            onClick={forceSync}
            title="Reintentar sincronización"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: `1px solid ${borderColor}`,
              borderRadius: "8px",
              color: "#e2e8f0",
              fontSize: "11px",
              fontWeight: 600,
              padding: "4px 8px",
              cursor: "pointer",
              flexShrink: 0,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
          >
            Reintentar
          </button>
        )}
      </div>
    </>
  );
}
