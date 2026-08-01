import Link from "next/link";
import { ModeToggle } from "@/core/components/mode-toggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      {/* Top Navbar */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <Link href="/dashboard" className="text-xl font-bold text-slate-900 dark:text-white">
          🧪 BioTools
        </Link>
        <div className="flex items-center gap-3">
          <ModeToggle />
          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {/* Placeholder de Avatar de Usuario */}
            M
          </div>
        </div>
      </header>

      {/* Contenido principal que cambiará según la ruta */}
      <main className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4">
        {children}
      </main>

      {/* Bottom Navigation (Ideal para PWA en móviles) */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 flex h-16 border-t bg-white px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:hidden dark:bg-slate-900 dark:border-slate-800">
        <Link href="/dashboard/calculadora" className="flex flex-1 flex-col items-center justify-center text-xs font-medium text-slate-500 hover:text-slate-900 active:text-slate-900">
          <span className="text-xl mb-1">⚖️</span>
          ChemCalc
        </Link>
        <Link href="/dashboard/academico" className="flex flex-1 flex-col items-center justify-center text-xs font-medium text-slate-500 hover:text-slate-900 active:text-slate-900">
          <span className="text-xl mb-1">📚</span>
          BioTrack
        </Link>
        <Link href="/dashboard/flashcards" className="flex flex-1 flex-col items-center justify-center text-xs font-medium text-slate-500 hover:text-slate-900 active:text-slate-900">
          <span className="text-xl mb-1">🧠</span>
          Flashcards
        </Link>
      </nav>
    </div>
  );
}