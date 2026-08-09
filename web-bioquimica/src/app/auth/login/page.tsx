import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
  return (
    // Nivel 0 (Fondo): bg-slate-50 claro, bg-slate-950 oscuro[cite: 5]
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      
      {/* Nivel 1 (Tarjetas): Fondo blanco, borde sutil Slate 200, radio 8px, sin sombra pesada[cite: 5] */}
      <Card className="w-full max-w-sm border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 rounded-lg">
        
        {/* Espaciado interno lg (24px)[cite: 5] - Shadcn lo maneja por defecto en CardHeader/Content, pero lo reforzamos visualmente */}
        <CardHeader className="space-y-2 text-center p-6 pb-4">
          <CardTitle className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            BioTools Lab
          </CardTitle>
          <CardDescription className="text-base text-slate-500">
            Acceso al panel de laboratorio
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 p-6 pt-0">
          <div className="space-y-2">
            {/* Etiquetas siempre arriba en etiqueta-bold[cite: 5] */}
            <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Correo electrónico
            </Label>
            {/* Borde Slate 200, en focus cambia a Emerald 600[cite: 5] */}
            <Input 
              id="email" 
              type="email" 
              placeholder="estudiante@bioquimica.edu.ar" 
              required 
              className="rounded bg-white border-slate-200 focus-visible:ring-emerald-100 focus-visible:border-emerald-600 dark:bg-slate-900 dark:border-slate-800 dark:focus-visible:ring-emerald-900/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Contraseña
            </Label>
            <Input 
              id="password" 
              type="password" 
              required 
              className="rounded bg-white border-slate-200 focus-visible:ring-emerald-100 focus-visible:border-emerald-600 dark:bg-slate-900 dark:border-slate-800 dark:focus-visible:ring-emerald-900/50"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 p-6 pt-0">
          <Link href="/dashboard" className="w-full">
            {/* Botón Primario: Emerald 600, sin borde, redondez 4px (rounded), alto min 44px (h-11) para móvil[cite: 5] */}
            <Button className="w-full h-11 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
              Iniciar Sesión
            </Button>
          </Link>
          <div className="text-sm text-center text-slate-500">
            ¿No tienes cuenta?{" "}
            <Link href="/auth/registro" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
              Regístrate aquí
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}