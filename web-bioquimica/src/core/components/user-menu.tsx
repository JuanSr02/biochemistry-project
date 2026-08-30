"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, ShieldCheck } from "lucide-react";
import { cerrarSesionAccion } from "@/modules/auth/actions";

interface UsuarioSesion {
  id: string;
  email: string;
  nombre: string;
}

export function UserMenu() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    const cargarUsuario = () => {
      try {
        const guardado = localStorage.getItem("biotools_user");
        if (guardado) {
          setUsuario(JSON.parse(guardado));
        } else {
          setUsuario({
            id: "usr-default",
            email: "luciana@bioquimica.edu.ar",
            nombre: "Luciana Gómez",
          });
        }
      } catch {
        setUsuario({
          id: "usr-default",
          email: "estudiante@bioquimica.edu.ar",
          nombre: "Estudiante Bioquímica",
        });
      }
    };
    
    cargarUsuario();
    window.addEventListener("storage", cargarUsuario);
    return () => window.removeEventListener("storage", cargarUsuario);
  }, []);

  const obtenerIniciales = (nombre: string) => {
    if (!nombre) return "B";
    const partes = nombre.trim().split(" ");
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return partes[0].substring(0, 2).toUpperCase();
  };

  const handleCerrarSesion = async () => {
    localStorage.removeItem("biotools_user");
    await cerrarSesionAccion();
    router.push("/auth/login");
  };

  const iniciales = usuario ? obtenerIniciales(usuario.nombre) : "B";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuAbierto(!menuAbierto)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all dark:bg-emerald-600 dark:hover:bg-emerald-500"
        title={usuario?.nombre || "Perfil del Estudiante"}
      >
        {iniciales}
      </button>

      {menuAbierto && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          onClick={() => setMenuAbierto(false)}
        >
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              {usuario?.nombre || "Estudiante Bioquímica"}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {usuario?.email || "estudiante@bioquimica.edu.ar"}
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => {
              setMenuAbierto(false);
              router.push("/dashboard/perfil");
            }}
            className="w-full flex items-center gap-2 px-2 py-2 mt-1 rounded text-xs font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            Mi Perfil
          </button>

          <button
            type="button"
            onClick={handleCerrarSesion}
            className="w-full flex items-center gap-2 px-2 py-2 mt-1 rounded text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}
