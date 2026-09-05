"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { iniciarSesion } from "@/modules/auth/actions";
import Link from "next/link";
import { Loader2, FlaskConical, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/modules/auth/store/useAuthStore";
import { useUser } from "@/modules/auth/hooks/useUser";

export default function LoginPage() {
  // Estado con Zustand
  const { isModalOpen, setModalOpen } = useAuthStore();
  
  // Caché con React Query
  const { data: userRq, isLoading: loadingUserRq } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor completa tu correo y contraseña.");
      return;
    }

    setCargando(true);
    setError(null);

    const res = await iniciarSesion(email, password);

    setCargando(false);

    if (res.success && res.user) {
      localStorage.setItem("biotools_user", JSON.stringify(res.user));
      router.push("/dashboard");
    } else {
      setError(res.error || "No se pudo iniciar sesión. Verifica tus credenciales.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden">
      {/* Background Image & Gradient Overlays */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{ backgroundImage: "url('/bg-login.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-emerald-950/90 to-slate-950/95 mix-blend-multiply" />
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" />
      </div>

      {/* Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse delay-1000" />

      <Card className="relative z-10 w-full max-w-md overflow-hidden border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl dark:border-white/5 dark:bg-slate-950/40 rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/10 dark:to-transparent pointer-events-none" />
        
        <CardHeader className="space-y-3 text-center p-8 pb-6 relative z-10">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 p-[1px] shadow-lg mb-2">
            <div className="w-full h-full rounded-2xl bg-white/90 dark:bg-slate-900/90 flex items-center justify-center backdrop-blur-md">
              <FlaskConical className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
            BioTools Lab
          </CardTitle>
          <CardDescription className="text-sm font-medium text-emerald-100/80 dark:text-emerald-200/70">
            Acceso al panel de laboratorio de bioquímica
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} className="relative z-10">
          <CardContent className="space-y-5 p-8 pt-0">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-white/90 ml-1">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="estudiante@bioquimica.edu.ar"
                required
                className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-emerald-400 focus-visible:border-emerald-400 backdrop-blur-md transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-white/90 ml-1">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-emerald-400 focus-visible:border-emerald-400 backdrop-blur-md transition-all"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 backdrop-blur-md">
                <p className="text-sm text-red-200 font-medium text-center">{error}</p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-5 p-8 pt-0">
            <Button
              type="submit"
              disabled={cargando}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 transition-all font-bold text-base shadow-lg shadow-emerald-500/25 group border border-emerald-400/20"
            >
              {cargando ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Iniciando Sesión...
                </>
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
            
            <div className="text-sm text-center text-white/70">
              ¿No tienes cuenta?{" "}
              <Link href="/auth/registro" className="font-semibold text-emerald-300 hover:text-white transition-colors drop-shadow-sm">
                Regístrate aquí
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}