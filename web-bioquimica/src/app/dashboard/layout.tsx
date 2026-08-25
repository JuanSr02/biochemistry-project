import Link from "next/link";
import { ModeToggle } from "@/core/components/mode-toggle";
import { UserMenu } from "@/core/components/user-menu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md md:px-10 dark:border-slate-800 dark:bg-slate-950/80">
        <Link href="/dashboard" className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
          🧪 BioTools <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded">Lab</span>
        </Link>
        <div className="flex items-center gap-3">
          <ModeToggle />
          <UserMenu />
        </div>
      </header>

      <main className="mx-auto flex-1 w-full max-w-[1280px] p-4 pb-24 md:p-10 md:pb-10">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 flex h-16 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:hidden">
        <Link href="/dashboard/calculadora" className="flex flex-1 flex-col items-center justify-center text-xs font-medium text-slate-500 transition-colors hover:text-emerald-600 active:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-500">
          <span className="mb-1 text-lg">⚖️</span>
          ChemCalc
        </Link>
        <Link href="/dashboard/academico" className="flex flex-1 flex-col items-center justify-center text-xs font-medium text-slate-500 transition-colors hover:text-emerald-600 active:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-500">
          <span className="mb-1 text-lg">📚</span>
          BioTrack
        </Link>
        <Link href="/dashboard/flashcards" className="flex flex-1 flex-col items-center justify-center text-xs font-medium text-slate-500 transition-colors hover:text-emerald-600 active:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-500">
          <span className="mb-1 text-lg">🧠</span>
          BioFlash
        </Link>
      </nav>
    </div>
  );
}