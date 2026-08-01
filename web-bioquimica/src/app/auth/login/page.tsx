import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            BioTools Lab
          </CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder a tu panel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" placeholder="estudiante@bioquimica.edu.ar" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {/* Por ahora este botón solo redirige visualmente al dashboard */}
          <Link href="/dashboard" className="w-full">
            <Button className="w-full bg-slate-900 text-white hover:bg-slate-800">
              Iniciar Sesión
            </Button>
          </Link>
          <div className="text-sm text-center text-slate-500">
            ¿No tienes cuenta?{" "}
            <Link href="/auth/registro" className="font-semibold text-slate-900 hover:underline dark:text-slate-50">
              Regístrate aquí
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}