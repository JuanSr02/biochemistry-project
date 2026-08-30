"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { User, ShieldAlert, Loader2, Save, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { actualizarPerfil, eliminarCuenta } from "@/modules/auth/actions";

interface UsuarioSesion {
  id: string;
  email: string;
  nombre: string;
}

export default function PerfilPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [nombre, setNombre] = useState("");
  const [cargandoGuardar, setCargandoGuardar] = useState(false);
  const [cargandoEliminar, setCargandoEliminar] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "success" | "error"; texto: string } | null>(null);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem("biotools_user");
      if (guardado) {
        const parsed = JSON.parse(guardado);
        setUsuario(parsed);
        setNombre(parsed.nombre || "");
      } else {
        router.push("/auth/login");
      }
    } catch {
      router.push("/auth/login");
    }
  }, [router]);

  const handleGuardar = async () => {
    if (!usuario) return;
    if (!nombre.trim()) {
      setMensaje({ tipo: "error", texto: "El nombre no puede estar vacío." });
      return;
    }

    setCargandoGuardar(true);
    setMensaje(null);

    const res = await actualizarPerfil(usuario.id, nombre);

    if (res.success) {
      const updatedUser = { ...usuario, nombre: nombre.trim() };
      localStorage.setItem("biotools_user", JSON.stringify(updatedUser));
      setUsuario(updatedUser);
      setMensaje({ tipo: "success", texto: "Perfil actualizado correctamente." });
      // Disparar evento para actualizar el UserMenu o forzar recarga
      window.dispatchEvent(new Event("storage"));
    } else {
      setMensaje({ tipo: "error", texto: res.error || "Hubo un error al actualizar el perfil." });
    }
    setCargandoGuardar(false);
  };

  const handleEliminar = async () => {
    if (!usuario) return;
    
    const confirmar = confirm(
      "¿Estás seguro de que deseas eliminar tu cuenta permanentemente? Esta acción borrará tus datos y no se puede deshacer."
    );
    
    if (!confirmar) return;

    setCargandoEliminar(true);
    setMensaje(null);

    const res = await eliminarCuenta(usuario.id);

    if (res.success) {
      localStorage.removeItem("biotools_user");
      router.push("/auth/login");
    } else {
      setMensaje({ tipo: "error", texto: res.error || "Hubo un error al eliminar la cuenta." });
      setCargandoEliminar(false);
    }
  };

  if (!usuario) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
          <Link href="/dashboard" className="hover:text-emerald-600 flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 md:text-3xl flex items-center gap-2">
          <User className="w-7 h-7 text-emerald-600" />
          Mi Perfil
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Gestiona tu información personal y configuración de cuenta.
        </p>
      </div>

      {mensaje && (
        <div className={`p-3 text-sm rounded-md border ${mensaje.tipo === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-900 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-300'}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Información del Perfil */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 dark:text-slate-100">Información Personal</CardTitle>
          <CardDescription>Actualiza tu nombre visible en la plataforma.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Correo Electrónico (No modificable)</Label>
            <Input 
              id="email" 
              value={usuario.email} 
              disabled 
              className="bg-slate-100 dark:bg-slate-800/50 text-slate-500" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-slate-700 dark:text-slate-300">Nombre Completo</Label>
            <Input 
              id="nombre" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              placeholder="Tu nombre" 
              className="bg-white dark:bg-slate-900 focus-visible:ring-emerald-600" 
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-4">
          <Button 
            onClick={handleGuardar} 
            disabled={cargandoGuardar || nombre.trim() === usuario.nombre}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {cargandoGuardar ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Guardar Cambios
          </Button>
        </CardFooter>
      </Card>

      {/* Zona de Peligro */}
      <Card className="border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20">
        <CardHeader>
          <CardTitle className="text-lg text-rose-700 dark:text-rose-400 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            Zona de Peligro
          </CardTitle>
          <CardDescription className="text-rose-600/80 dark:text-rose-400/80">
            Una vez elimines tu cuenta, no hay vuelta atrás.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
            Esto eliminará permanentemente tu cuenta.
          </p>
          <Button 
            variant="destructive" 
            onClick={handleEliminar} 
            disabled={cargandoEliminar}
            className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700"
          >
            {cargandoEliminar ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
            Eliminar mi cuenta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
