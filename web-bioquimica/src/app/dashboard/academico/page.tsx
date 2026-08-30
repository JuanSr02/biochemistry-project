"use client";

import { useEffect, useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { MateriasLista } from "@/modules/academico/components/materias-lista";
import { TpsLista } from "@/modules/academico/components/tps-lista";
import { LaboratoriosLista } from "@/modules/academico/components/laboratorios-lista";
import { getMaterias, getTrabajosPracticos, getLaboratorios } from "@/modules/academico/actions";
import { Materia, TrabajoPractico, Laboratorio } from "@/modules/academico/types";
import Link from "next/link";
import { ArrowLeft, BookOpen, FileSpreadsheet, FlaskConical, Loader2 } from "lucide-react";

export default function AcademicoPage() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [tps, setTps] = useState<TrabajoPractico[]>([]);
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    let userId: string | undefined = undefined;
    try {
      const stored = localStorage.getItem("biotools_user");
      if (stored) {
        const user = JSON.parse(stored);
        userId = user.id;
      }
    } catch (e) {
      // ignore
    }

    const [resMat, resTps, resLabs] = await Promise.all([
      getMaterias(userId),
      getTrabajosPracticos(userId),
      getLaboratorios(userId),
    ]);

    if (resMat.success) setMaterias(resMat.data);
    if (resTps.success) setTps(resTps.data);
    if (resLabs.success) setLaboratorios(resLabs.data);

    setLoading(false);
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

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
          <TabsList className="mb-4 flex-wrap sm:flex-nowrap">
            <TabsTrigger value="laboratorios">
              <FlaskConical className="w-4 h-4 mr-1.5" />
              Laboratorios ({laboratorios.length})
            </TabsTrigger>
            <TabsTrigger value="tps">
              <FileSpreadsheet className="w-4 h-4 mr-1.5" />
              Trabajos Prácticos ({tps.length})
            </TabsTrigger>
            <TabsTrigger value="materias">
              <BookOpen className="w-4 h-4 mr-1.5" />
              Materias ({materias.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="laboratorios">
            <LaboratoriosLista laboratorios={laboratorios} materias={materias} onRefresh={cargarDatos} />
          </TabsContent>

          <TabsContent value="tps">
            <TpsLista tps={tps} materias={materias} onRefresh={cargarDatos} />
          </TabsContent>

          <TabsContent value="materias">
            <MateriasLista materias={materias} onRefresh={cargarDatos} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
