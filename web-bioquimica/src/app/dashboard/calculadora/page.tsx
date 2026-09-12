"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { SolucionSolidaForm } from "@/modules/calculadora/components/solucion-solida-form";
import { DilucionForm } from "@/modules/calculadora/components/dilucion-form";
import Link from "next/link";
import { ArrowLeft, History, Trash2, Clock } from "lucide-react";
import { useCalculadoraStore } from "@/modules/calculadora/store/useCalculadoraStore";
import { Button } from "@/core/components/ui/button";

export default function CalculadoraPage() {
  const { historial, clearHistorial } = useCalculadoraStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      {/* Header con botón de retorno */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href="/dashboard" className="hover:text-emerald-600 flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Inicio
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-200 font-medium">ChemCalc</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 md:text-3xl">
            ChemCalc — Calculadora de Soluciones
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Herramienta científica para cálculos exactos de masa de reactivo, mezclas y diluciones de laboratorio.
          </p>
        </div>
      </div>

      {/* Tabs para seleccionar el tipo de cálculo */}
      <Tabs defaultValue="solida" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="solida">
            <span>⚖️</span> Soluto Sólido
          </TabsTrigger>
          <TabsTrigger value="dilucion">
            <span>🧪</span> Dilución (C1V1 = C2V2)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="solida">
          <SolucionSolidaForm />
        </TabsContent>

        <TabsContent value="dilucion">
          <DilucionForm />
        </TabsContent>
      </Tabs>

      {/* Historial Section */}
      {mounted && historial.length > 0 && (
        <div className="mt-12 space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600" /> Historial de Cálculos
            </h2>
            <Button variant="ghost" size="sm" onClick={clearHistorial} className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30">
              <Trash2 className="w-4 h-4 mr-1.5" /> Limpiar
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {historial.map((entry) => (
              <div key={entry.id} className="p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-xl"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                    {entry.tipo === 'solida' ? 'Soluto Sólido' : 'Dilución'}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {(entry.resultado as any).mensaje || 'Cálculo realizado exitosamente'}
                </p>
                {'masaGramos' in entry.resultado && (
                  <p className="text-xs text-slate-500 mt-1 font-mono bg-slate-50 dark:bg-slate-950 p-1.5 rounded inline-block">
                    Masa a pesar: {(entry.resultado as any).masaConPureza} g
                  </p>
                )}
                {'volumenTomar' in entry.resultado && (
                  <p className="text-xs text-slate-500 mt-1 font-mono bg-slate-50 dark:bg-slate-950 p-1.5 rounded inline-block">
                    Volumen a tomar: {(entry.resultado as any).volumenTomar} mL
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
