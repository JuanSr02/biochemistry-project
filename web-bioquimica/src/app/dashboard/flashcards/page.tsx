"use client";

import { useState } from "react";
import { useTarjetas } from "@/modules/flashcards/hooks/useTarjetas";
import { useFlashcardMutations } from "@/modules/flashcards/hooks/useFlashcardMutations";
import { useFlashcardsStore } from "@/modules/flashcards/store/useFlashcardsStore";
import { useMaterias } from "@/modules/academico/hooks/useMaterias";
import { FlashcardItem } from "@/modules/flashcards/components/flashcard-item";
import { FlashcardsLista } from "@/modules/flashcards/components/flashcards-lista";
import { Card, CardContent } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  RotateCw,
  CheckCircle2,
  Award,
  BookOpen,
  Settings,
  Loader2,
} from "lucide-react";

export default function FlashcardsPage() {
  // ── React Query: datos del servidor con caché ──────────────────────────
  const { data: tarjetas = [], isLoading: loadingTarjetas } = useTarjetas();
  const { data: materias = [], isLoading: loadingMaterias } = useMaterias();
  const { responder } = useFlashcardMutations();

  // ── Zustand: todo el estado efímero de la sesión de repaso ─────────────
  const {
    mazoActivo,
    indexActual,
    stats,
    setMazoActivo,
    registrarAcierto,
    registrarError,
    avanzarTarjeta,
    reiniciarSesion,
  } = useFlashcardsStore();

  const loading = loadingTarjetas || loadingMaterias;

  // Filtrado de tarjetas según el mazo activo
  const tarjetasFiltradas =
    mazoActivo === "todas" ? tarjetas : tarjetas.filter((t) => t.materia_id === mazoActivo);
  const tarjetaActual = tarjetasFiltradas[indexActual];

  const handleResponder = async (sabias: boolean) => {
    if (!tarjetaActual) return;

    // 1. Registrar en Zustand (actualización inmediata de la UI)
    if (sabias) registrarAcierto();
    else registrarError();

    // 2. Persistir en el servidor via useMutation (invalida caché automáticamente)
    responder.mutate({ id: tarjetaActual.id, sabias });

    // 3. Avanzar a la siguiente tarjeta
    avanzarTarjeta(tarjetasFiltradas.length);
  };

  const totalRespondidas = stats.aciertos + stats.errores;
  const porcentajeDominio =
    totalRespondidas > 0 ? Math.round((stats.aciertos / totalRespondidas) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
          <Link
            href="/dashboard"
            className="hover:text-emerald-600 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Inicio
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-200 font-medium">BioFlash</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 md:text-3xl flex items-center gap-2">
          <Brain className="w-7 h-7 text-emerald-600" />
          BioFlash — Repaso de Estudio
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Memorización activa de conceptos clave.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2 text-emerald-600" />
          Cargando mazos de estudio...
        </div>
      ) : (
        <>
          {/* Selector de Mazo */}
          <div className="flex items-center gap-2 max-w-sm">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
              Mazo:
            </span>
            <select
              value={mazoActivo}
              onChange={(e) => setMazoActivo(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="todas">Todos los Mazos</option>
              {materias.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          <Tabs defaultValue="repaso" className="w-full">
            <TabsList className="mb-6 inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <TabsTrigger
                value="repaso"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-slate-50"
              >
                <RotateCw className="w-4 h-4 mr-2" /> Sesión de Repaso
              </TabsTrigger>
              <TabsTrigger
                value="gestion"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-slate-50"
              >
                <Settings className="w-4 h-4 mr-2" /> Gestión de Mazo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="repaso" className="space-y-6">
              {/* Métricas de Sesión — vienen de Zustand */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Respuestas Correctas</span>
                      <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {stats.aciertos}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Progreso Mazo</span>
                      <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {tarjetasFiltradas.length > 0
                          ? `${indexActual + 1} / ${tarjetasFiltradas.length}`
                          : "0"}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">% Conocimiento</span>
                      <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {porcentajeDominio}%
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {tarjetaActual ? (
                <div className="space-y-4 pt-2">
                  <FlashcardItem tarjeta={tarjetaActual} onResponder={handleResponder} />
                  <div className="flex justify-center pt-2">
                    <Button
                      onClick={reiniciarSesion}
                      variant="outline"
                      className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                    >
                      <RotateCw className="w-3.5 h-3.5 mr-1.5" /> Reiniciar Sesión de Estudio
                    </Button>
                  </div>
                </div>
              ) : (
                <Card className="p-10 text-center space-y-3 border-slate-200 dark:border-slate-800">
                  <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
                    ¡Has completado todas las tarjetas del mazo o no hay tarjetas disponibles!
                  </p>
                  <Button
                    onClick={reiniciarSesion}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Comenzar nueva ronda
                  </Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="gestion" className="space-y-6">
              <FlashcardsLista
                tarjetas={tarjetasFiltradas}
                materias={materias}
                onUpdate={() => {}}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
