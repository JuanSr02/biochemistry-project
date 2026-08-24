"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { SolucionSolidaForm } from "@/modules/calculadora/components/solucion-solida-form";
import { DilucionForm } from "@/modules/calculadora/components/dilucion-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CalculadoraPage() {
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
    </div>
  );
}
