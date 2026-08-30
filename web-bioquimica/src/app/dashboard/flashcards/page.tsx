"use client";

import { useEffect, useState } from "react";
import { getTarjetasEstudio, registrarRespuestaFlashcard } from "@/modules/flashcards/actions";
import { getMaterias } from "@/modules/academico/actions";
import { TarjetaEstudio } from "@/modules/flashcards/types";
import { Materia } from "@/modules/academico/types";
import { FlashcardItem } from "@/modules/flashcards/components/flashcard-item";
import { FlashcardsLista } from "@/modules/flashcards/components/flashcards-lista";
import { Card, CardContent } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import Link from "next/link";
import { ArrowLeft, Brain, RotateCw, CheckCircle2, Award, BookOpen, Settings } from "lucide-react";

export default function FlashcardsPage() {
  const [tarjetas, setTarjetas] = useState<TarjetaEstudio[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [filtroMateria, setFiltroMateria] = useState<string>("todas");
  const [indexActual, setIndexActual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [aciertos, setAciertos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [refreshToggle, setRefreshToggle] = useState(false);

  const fetchTarjetas = async () => {
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
    const res = await getTarjetasEstudio(userId);
    if (res.success) setTarjetas(res.data);

    const resMaterias = await getMaterias(userId);
    if (resMaterias.success) setMaterias(resMaterias.data);

    setLoading(false);
  };

  useEffect(() => {
    fetchTarjetas();
  }, [refreshToggle]);

  const handleUpdate = () => {
    setRefreshToggle(prev => !prev);
  };

  const tarjetasFiltradas = filtroMateria === "todas" ? tarjetas : tarjetas.filter(t => t.materia_id === filtroMateria);
  const tarjetaActual = tarjetasFiltradas[indexActual];

  const handleResponder = async (sabias: boolean) => {
    if (!tarjetaActual) return;

    if (sabias) {
      setAciertos((prev) => prev + 1);
    } else {
      setErrores((prev) => prev + 1);
    }

    await registrarRespuestaFlashcard(tarjetaActual.id, sabias);

    // Avanzar a la siguiente tarjeta
    if (indexActual < tarjetasFiltradas.length - 1) {
      setIndexActual((prev) => prev + 1);
    } else {
      // Reiniciar ciclo
      setIndexActual(0);
    }
  };

  const reiniciarSesion = () => {
    setIndexActual(0);
    setAciertos(0);
    setErrores(0);
  };

  const totalRespondidas = aciertos + errores;
  const porcentajeDominio = totalRespondidas > 0 ? Math.round((aciertos / totalRespondidas) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
          <Link href="/dashboard" className="hover:text-emerald-600 flex items-center gap-1 transition-colors">
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

      <div className="flex items-center gap-2 max-w-sm">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">Mazo:</span>
        <select
          value={filtroMateria}
          onChange={(e) => {
            setFiltroMateria(e.target.value);
            reiniciarSesion();
          }}
          className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="todas">Todos los Mazos</option>
          {materias.map(m => (
            <option key={m.id} value={m.id}>{m.nombre}</option>
          ))}
        </select>
      </div>

      <Tabs defaultValue="repaso" className="w-full">
        <TabsList className="mb-6 inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <TabsTrigger value="repaso" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-slate-50">
            <RotateCw className="w-4 h-4 mr-2" /> Sesión de Repaso
          </TabsTrigger>
          <TabsTrigger value="gestion" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-slate-50">
            <Settings className="w-4 h-4 mr-2" /> Gestión de Mazo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="repaso" className="space-y-6">
          {/* Widget de Métricas de Repaso */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Respuestas Correctas</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{aciertos}</span>
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
                    {tarjetasFiltradas.length > 0 ? `${indexActual + 1} / ${tarjetasFiltradas.length}` : "0"}
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
                  <span className="text-xs text-slate-500 block">Porcentaje de conocimiento</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {porcentajeDominio}%
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Área del Tarjetero Interactivo */}
          {loading ? (
            <Card className="p-12 text-center text-slate-500">Cargando mazo de estudio...</Card>
          ) : tarjetaActual ? (
            <div className="space-y-4 pt-2">
              <FlashcardItem tarjeta={tarjetaActual} onResponder={handleResponder} />

              <div className="flex justify-center pt-2">
                <Button
                  onClick={reiniciarSesion}
                  variant="outline"
                  className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  <RotateCw className="w-3.5 h-3.5 mr-1.5" /> Reiniciar Sesión de Estudo
                </Button>
              </div>
            </div>
          ) : (
            <Card className="p-10 text-center space-y-3 border-slate-200 dark:border-slate-800">
              <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
                ¡Has completado todas las tarjetas del mazo o no hay tarjetas disponibles!
              </p>
              <Button onClick={reiniciarSesion} className="bg-emerald-600 text-white hover:bg-emerald-700">
                Comenzar nueva ronda
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="gestion" className="space-y-6">
          <FlashcardsLista tarjetas={tarjetasFiltradas} materias={materias} onUpdate={handleUpdate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
