"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card";
import { calcularSolucionSolida } from "../actions";
import { SolucionSolidaResultado } from "../types";
import { ResultadoCard } from "./resultado-card";
import { Loader2 } from "lucide-react";

const solucionSolidaSchema = z.object({
  volumenMl: z.coerce
    .number({ invalid_type_error: "Debe ingresar un número válido" })
    .positive("El volumen debe ser un número mayor a 0"),
  concentracionMolar: z.coerce
    .number({ invalid_type_error: "Debe ingresar un número válido" })
    .positive("La concentración debe ser un número mayor a 0"),
  pesoMolecular: z.coerce
    .number({ invalid_type_error: "Debe ingresar un número válido" })
    .positive("El peso molecular debe ser un número mayor a 0"),
  purezaPorcentaje: z.coerce
    .number({ invalid_type_error: "Debe ingresar un número válido" })
    .min(0.1, "La pureza debe ser mayor a 0%")
    .max(100, "La pureza no puede exceder 100%"),
});

type SolucionSolidaFormValues = z.infer<typeof solucionSolidaSchema>;

export function SolucionSolidaForm() {
  const [resultado, setResultado] = useState<SolucionSolidaResultado | null>(null);
  const [errorServer, setErrorServer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SolucionSolidaFormValues>({
    resolver: zodResolver(solucionSolidaSchema),
    defaultValues: {
      volumenMl: 500,
      concentracionMolar: 0.1,
      pesoMolecular: 58.44, // NaOH / NaCl aprox
      purezaPorcentaje: 100,
    },
  });

  const onSubmit = async (data: SolucionSolidaFormValues) => {
    setIsLoading(true);
    setErrorServer(null);
    setResultado(null);

    const res = await calcularSolucionSolida(data);
    setIsLoading(false);

    if (res.success && res.data) {
      setResultado(res.data);
    } else {
      setErrorServer(res.error || "Error al realizar el cálculo.");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 rounded-lg shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <span>⚖️</span> Preparación de Solución a partir de Soluto Sólido
          </CardTitle>
          <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
            Calcula los gramos necesarios a pesar en balanza analítica en función de la molaridad, volumen y pureza.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Volumen (mL) */}
              <div className="space-y-1.5">
                <Label htmlFor="volumenMl" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Volumen deseado (mL) *
                </Label>
                <Input
                  id="volumenMl"
                  type="number"
                  step="any"
                  placeholder="Ej: 500"
                  {...register("volumenMl")}
                  className="rounded h-11 bg-white border-slate-200 focus-visible:ring-emerald-100 focus-visible:border-emerald-600 dark:bg-slate-900 dark:border-slate-800"
                />
                {errors.volumenMl && (
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{errors.volumenMl.message}</p>
                )}
              </div>

              {/* Concentración (Molar) */}
              <div className="space-y-1.5">
                <Label htmlFor="concentracionMolar" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Concentración (Molar - M) *
                </Label>
                <Input
                  id="concentracionMolar"
                  type="number"
                  step="any"
                  placeholder="Ej: 0.1"
                  {...register("concentracionMolar")}
                  className="rounded h-11 bg-white border-slate-200 focus-visible:ring-emerald-100 focus-visible:border-emerald-600 dark:bg-slate-900 dark:border-slate-800"
                />
                {errors.concentracionMolar && (
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{errors.concentracionMolar.message}</p>
                )}
              </div>

              {/* Peso Molecular (g/mol) */}
              <div className="space-y-1.5">
                <Label htmlFor="pesoMolecular" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Peso Molecular (g/mol) *
                </Label>
                <Input
                  id="pesoMolecular"
                  type="number"
                  step="any"
                  placeholder="Ej: 58.44"
                  {...register("pesoMolecular")}
                  className="rounded h-11 bg-white border-slate-200 focus-visible:ring-emerald-100 focus-visible:border-emerald-600 dark:bg-slate-900 dark:border-slate-800"
                />
                {errors.pesoMolecular && (
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{errors.pesoMolecular.message}</p>
                )}
              </div>

              {/* Pureza (%) */}
              <div className="space-y-1.5">
                <Label htmlFor="purezaPorcentaje" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Pureza del Reactivo (%) *
                </Label>
                <Input
                  id="purezaPorcentaje"
                  type="number"
                  step="any"
                  placeholder="Ej: 99.5"
                  {...register("purezaPorcentaje")}
                  className="rounded h-11 bg-white border-slate-200 focus-visible:ring-emerald-100 focus-visible:border-emerald-600 dark:bg-slate-900 dark:border-slate-800"
                />
                {errors.purezaPorcentaje && (
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{errors.purezaPorcentaje.message}</p>
                )}
              </div>
            </div>

            {errorServer && (
              <div className="p-3 text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 rounded-md dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900">
                {errorServer}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded bg-emerald-600 text-white hover:bg-emerald-700 font-semibold transition-colors mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculando en Servidor...
                </>
              ) : (
                "Calcular Masa Requerida"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {resultado && <ResultadoCard tipo="solida" resultadoSolida={resultado} />}
    </div>
  );
}
