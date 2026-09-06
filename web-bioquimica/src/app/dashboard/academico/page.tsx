"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { MateriasLista } from "@/modules/academico/components/materias-lista";
import { TpsLista } from "@/modules/academico/components/tps-lista";
import { LaboratoriosLista } from "@/modules/academico/components/laboratorios-lista";
import Link from "next/link";
import { ArrowLeft, BookOpen, FileSpreadsheet, FlaskConical, Loader2, AlertCircle } from "lucide-react";
import { useMaterias } from "@/modules/academico/hooks/useMaterias";
import { useTps } from "@/modules/academico/hooks/useTps";
import { useLaboratorios } from "@/modules/academico/hooks/useLaboratorios";

export default function AcademicoPage() {
  const { data: materias = [], isLoading: loadingMaterias, refetch: refetchMaterias } = useMaterias();
  const { data: tps = [], isLoading: loadingTps, refetch: refetchTps } = useTps();
  const { data: laboratorios = [], isLoading: loadingLabs, refetch: refetchLabs } = useLaboratorios();

  const loading = loadingMaterias || loadingTps || loadingLabs;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
          <Link href="/dashboard" className="hover:text-emerald-600 flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Inicio
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-200 font-medium">BioTrack</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 md:text-3xl">
          BioTrack — Gestión Académica
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Control unificado académico.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2 text-emerald-600" />
          Cargando gestión académica...
        </div>
      ) : (
        <Tabs defaultValue="laboratorios" className="w-full">
          <TabsList className="mb-6 flex h-auto w-full justify-start overflow-x-auto p-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <TabsTrigger value="laboratorios" className="flex-shrink-0 px-4 py-2 data-[state=active]:shadow-sm">
              <FlaskConical className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
              Labs ({laboratorios.length})
            </TabsTrigger>
            <TabsTrigger value="tps" className="flex-shrink-0 px-4 py-2 data-[state=active]:shadow-sm">
              <FileSpreadsheet className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
              TPs ({tps.length})
            </TabsTrigger>
            <TabsTrigger value="materias" className="flex-shrink-0 px-4 py-2 data-[state=active]:shadow-sm">
              <BookOpen className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
              Materias ({materias.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="laboratorios">
            <LaboratoriosLista laboratorios={laboratorios} materias={materias} onRefresh={refetchLabs} />
          </TabsContent>

          <TabsContent value="tps">
            <TpsLista tps={tps} materias={materias} onRefresh={refetchTps} />
          </TabsContent>

          <TabsContent value="materias">
            <MateriasLista materias={materias} onRefresh={refetchMaterias} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
