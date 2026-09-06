"use client";

import { useRef, useEffect } from "react";
import { useAppStore } from "@/core/store/useAppStore";
import { createClient } from "@/core/lib/supabase/client";
import { isSupabaseConfigured } from "@/core/lib/supabase/utils";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  // Synchronous render-time hydration (client side only)
  // Ensures `usuario` is populated in Zustand BEFORE any child component mounts or runs query hooks.
  if (!initialized.current && typeof window !== "undefined") {
    initialized.current = true;
    const currentUser = useAppStore.getState().usuario;
    if (!currentUser) {
      try {
        const guardado = localStorage.getItem("biotools_user");
        if (guardado) {
          useAppStore.setState({ usuario: JSON.parse(guardado) });
        }
      } catch {
        // Safe fallback if JSON parsing fails
      }
    }
  }

  // Fallback: Read active session directly from Supabase Auth client if local state is missing
  useEffect(() => {
    const currentUser = useAppStore.getState().usuario;
    if (currentUser) return;
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const user = {
          id: session.user.id,
          email: session.user.email ?? "",
          nombre:
            session.user.user_metadata?.nombre_completo ??
            session.user.email?.split("@")[0] ??
            "Estudiante",
        };
        useAppStore.setState({ usuario: user });
        localStorage.setItem("biotools_user", JSON.stringify(user));
      }
    });
  }, []);

  return <>{children}</>;
}
