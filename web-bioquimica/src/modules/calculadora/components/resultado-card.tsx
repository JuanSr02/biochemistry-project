import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { CheckCircle2, FlaskConical, TestTube } from "lucide-react";
import { SolucionSolidaResultado, DilucionResultado } from "../types";

interface ResultadoCardProps {
  tipo: "solida" | "dilucion";
  resultadoSolida?: SolucionSolidaResultado;
  resultadoDilucion?: DilucionResultado;
}

export function ResultadoCard({ tipo, resultadoSolida, resultadoDilucion }: ResultadoCardProps) {
  if (tipo === "solida" && resultadoSolida) {
    return (
      <Card className="border-emerald-300 bg-emerald-50/70 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/40 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <CardHeader className="pb-3 border-b border-emerald-200 dark:border-emerald-900/60">
          <CardTitle className="flex items-center gap-2 text-lg text-emerald-900 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            Resultado del Cálculo - Solución Sólida
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg bg-white/80 dark:bg-slate-900/70 p-3 border border-emerald-200/80 dark:border-emerald-900/50">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Masa Real a Pesar</span>
              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {resultadoSolida.masaRealGramos} <span className="text-sm font-normal text-slate-600 dark:text-slate-300">g</span>
              </span>
              {resultadoSolida.purezaPorcentaje < 100 && (
                <span className="text-xs text-slate-500 block mt-0.5">
                  (Masa pura requerida: {resultadoSolida.masaPuraGramos} g)
                </span>
              )}
            </div>

            <div className="rounded-lg bg-white/80 dark:bg-slate-900/70 p-3 border border-emerald-200/80 dark:border-emerald-900/50">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Volumen & Concentración</span>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {resultadoSolida.volumenMl} mL @ {resultadoSolida.concentracionMolar} M
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                PM: {resultadoSolida.pesoMolecular} g/mol | Pureza: {resultadoSolida.purezaPorcentaje}%
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>📝</span> Protocolo de Preparación en Laboratorio:
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {resultadoSolida.instrucciones.map((paso, idx) => (
                <li key={idx} className="pl-1 leading-relaxed">
                  {paso}
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tipo === "dilucion" && resultadoDilucion) {
    return (
      <Card className="border-emerald-300 bg-emerald-50/70 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/40 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <CardHeader className="pb-3 border-b border-emerald-200 dark:border-emerald-900/60">
          <CardTitle className="flex items-center gap-2 text-lg text-emerald-900 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            Resultado del Cálculo - Dilución
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg bg-white/80 dark:bg-slate-900/70 p-3 border border-emerald-200/80 dark:border-emerald-900/50">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Alícuota de Solución Madre (V1)</span>
              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {resultadoDilucion.volumenAlicuotaMl} <span className="text-sm font-normal text-slate-600 dark:text-slate-300">mL</span>
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                Tomar de solución {resultadoDilucion.concentracionInicial} M
              </span>
            </div>

            <div className="rounded-lg bg-white/80 dark:bg-slate-900/70 p-3 border border-emerald-200/80 dark:border-emerald-900/50">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Volumen de Solvente Requerido</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {resultadoDilucion.volumenSolventeMl} <span className="text-sm font-normal text-slate-600 dark:text-slate-300">mL</span>
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                Para completar a {resultadoDilucion.volumenFinalMl} mL final ({resultadoDilucion.concentracionFinal} M)
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>🧪</span> Protocolo de Dilución:
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {resultadoDilucion.instrucciones.map((paso, idx) => (
                <li key={idx} className="pl-1 leading-relaxed">
                  {paso}
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
