"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { iniciarSesion } from "@/modules/auth/actions";
import Link from "next/link";
import { Loader2, FlaskConical } from "lucide-react";

export default function LoginPage() {
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <Card className="w-full max-w-sm border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 rounded-lg">
        <CardHeader className="space-y-2 text-center p-6 pb-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 mb-1">
            <FlaskConical className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            BioTools Lab
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Acceso al panel de laboratorio de bioquímica
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 p-6 pt-0">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="estudiante@bioquimica.edu.ar"
                required
                className="rounded bg-white border-slate-200 focus-visible:ring-emerald-100 focus-visible:border-emerald-600 dark:bg-slate-900 dark:border-slate-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded bg-white border-slate-200 focus-visible:ring-emerald-100 focus-visible:border-emerald-600 dark:bg-slate-900 dark:border-slate-800"
              />
            </div>

            {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 p-6 pt-0">
            <Button
              type="submit"
              disabled={cargando}
              className="w-full h-11 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-semibold"
            >
              {cargando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Iniciando Sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
            <div className="text-xs text-center text-slate-500">
              ¿No tienes cuenta?{" "}
              <Link href="/auth/registro" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                Regístrate aquí
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}