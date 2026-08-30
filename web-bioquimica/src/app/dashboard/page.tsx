import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 md:text-3xl">
          Panel de Bioquímica
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Selecciona un módulo para comenzar a trabajar.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        <Link href="/dashboard/calculadora" className="block transition-transform active:scale-[0.98]">
          <Card className="h-full rounded-lg border-slate-200 bg-white p-2 shadow-sm transition-colors hover:border-emerald-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl">
                <span>⚖️</span> ChemCalc
              </CardTitle>
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-500">
                Herramientas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Calculadora Bioquímica.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/academico" className="block transition-transform active:scale-[0.98]">
          <Card className="h-full rounded-lg border-slate-200 bg-white p-2 shadow-sm transition-colors hover:border-emerald-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl">
                <span>📚</span> BioTrack
              </CardTitle>
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-500">
                Gestión
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Agenda académica.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/flashcards" className="block transition-transform active:scale-[0.98]">
          <Card className="h-full rounded-lg border-slate-200 bg-white p-2 shadow-sm transition-colors hover:border-emerald-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl">
                <span>🧠</span> BioFlash
              </CardTitle>
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-500">
                Estudio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Tarjetas interactivas para estudiar.
              </p>
            </CardContent>
          </Card>
        </Link>

      </div>

      <section className="mt-8 pt-4">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Próximas entregas
        </h2>
        <Card className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="flex flex-col items-center justify-center p-10 text-center">
            <span className="mb-3 text-3xl opacity-80">✅</span>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              No hay tareas pendientes.
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Tu calendario está al día.
            </p>
          </CardContent>
        </Card>
      </section>
      
    </div>
  );
}