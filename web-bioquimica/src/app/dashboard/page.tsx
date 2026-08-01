import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Saludo y Encabezado */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          ¡Hola! 👋
        </h1>
        <p className="mt-1 text-slate-500">
          Bienvenida a tu panel de control. ¿Qué necesitas hacer hoy?
        </p>
      </div>

      {/* Grid de Módulos (Se apilan en celular, 3 columnas en PC) */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Módulo 1: ChemCalc */}
        <Link href="/dashboard/calculadora" className="block transition-transform active:scale-95">
          <Card className="h-full border-slate-200 hover:border-slate-400 dark:border-slate-800 dark:hover:border-slate-600 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">⚖️</span>
                ChemCalc
              </CardTitle>
              <CardDescription>Herramientas de laboratorio</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-500">
              Preparación rápida de soluciones, diluciones exactas y conversión de unidades al instante.
            </CardContent>
          </Card>
        </Link>

        {/* Módulo 2: BioTrack */}
        <Link href="/dashboard/academico" className="block transition-transform active:scale-95">
          <Card className="h-full border-slate-200 hover:border-slate-400 dark:border-slate-800 dark:hover:border-slate-600 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📚</span>
                BioTrack
              </CardTitle>
              <CardDescription>Gestión académica</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-500">
              Control de estado de materias, correlativas y bitácora de Trabajos Prácticos (TPs).
            </CardContent>
          </Card>
        </Link>

        {/* Módulo 3: BioFlash */}
        <Link href="/dashboard/flashcards" className="block transition-transform active:scale-95">
          <Card className="h-full border-slate-200 hover:border-slate-400 dark:border-slate-800 dark:hover:border-slate-600 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🧠</span>
                BioFlash
              </CardTitle>
              <CardDescription>Repaso espaciado</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-500">
              Tarjetas de estudio interactivas para vías metabólicas, estructuras químicas y farmacología.
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Sección de recordatorios o widgets rápidos */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">
          Próximos Parciales y Entregas de TPs
        </h2>
        <Card className="border-slate-200 shadow-sm dark:border-slate-800">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <span className="text-4xl mb-3">✅</span>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No hay entregas pendientes para esta semana.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              ¡Excelente trabajo! Tienes todo al día.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}