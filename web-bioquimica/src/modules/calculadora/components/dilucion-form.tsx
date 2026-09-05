"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { ResultadoCard } from "./resultado-card";
import { Loader2 } from "lucide-react";
import { useCalcularDilucion } from "../hooks/useCalcularSolucion";
import { useCalculadoraStore } from "../store/useCalculadoraStore";

const dilucionSchema = z
  .object({
    concentracionInicial: z.coerce
      .number({ invalid_type_error: "Debe ingresar un número válido" })
      .positive("La concentración madre C1 debe ser mayor a 0"),
    concentracionFinal: z.coerce
      .number({ invalid_type_error: "Debe ingresar un número válido" })
      .positive("La concentración deseada C2 debe ser mayor a 0"),
    volumenFinalMl: z.coerce
      .number({ invalid_type_error: "Debe ingresar un número válido" })
      .positive("El volumen final V2 debe ser mayor a 0"),
  })
  .refine((data) => data.concentracionFinal < data.concentracionInicial, {
    message: "La concentración final (C2) debe ser menor a la concentración madre (C1)",
    path: ["concentracionFinal"],
  });

type DilucionFormValues = z.infer<typeof dilucionSchema>;

export function DilucionForm() {
  // ── useMutation: llama al server action y guarda en Zustand automáticamente
  const calcularMutation = useCalcularDilucion();
  // ── Zustand: lee el último resultado (actualizado por la mutation)
  const ultimoResultado = useCalculadoraStore((s) => s.ultimoResultadoDilucion);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DilucionFormValues>({
    resolver: zodResolver(dilucionSchema),
    defaultValues: {
      concentracionInicial: 10,
      concentracionFinal: 1,
      volumenFinalMl: 100,
    },
  });

  const onSubmit = (data: DilucionFormValues) => {
    calcularMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 rounded-lg shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <span>🧪</span> Calculadora de Diluciones (C1 · V1 = C2 · V2)
          </CardTitle>
          <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
            Calcula la alícuota requerida de la solución madre y el volumen de solvente para
            obtener la concentración deseada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* C1 */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="concentracionInicial"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Concentración Madre (C1) *
                </Label>
                <Input
                  id="concentracionInicial"
                  type="number"
                  step="any"
                  placeholder="Ej: 10"
                  {...register("concentracionInicial")}
                  className="rounded h-11 bg-white border-slate-200 focus-visible:ring-emerald-100 focus-visible:border-emerald-600 dark:bg-slate-900 dark:border-slate-800"
                />
                {errors.concentracionInicial && (
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                    {errors.concentracionInicial.message}
                  </p>
                )}
              </div>

              {/* C2 */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="concentracionFinal"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Concentración Deseada (C2) *
                </Label>
                <Input
                  id="concentracionFinal"
                  type="number"
                  step="any"
                  placeholder="Ej: 1"
                  {...register("concentracionFinal")}
                  className="rounded h-11 bg-white border-slate-200 focus-visible:ring-emerald-100 focus-visible:border-emerald-600 dark:bg-slate-900 dark:border-slate-800"
                />
                {errors.concentracionFinal && (
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                    {errors.concentracionFinal.message}
                  </p>
                )}
              </div>

              {/* V2 */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="volumenFinalMl"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Volumen Final Deseado (V2 en mL) *
                </Label>
                <Input
                  id="volumenFinalMl"
                  type="number"
                  step="any"
                  placeholder="Ej: 100"
                  {...register("volumenFinalMl")}
                  className="rounded h-11 bg-white border-slate-200 focus-visible:ring-emerald-100 focus-visible:border-emerald-600 dark:bg-slate-900 dark:border-slate-800"
                />
                {errors.volumenFinalMl && (
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                    {errors.volumenFinalMl.message}
                  </p>
                )}
              </div>
            </div>

            {/* Error del servidor via mutation */}
            {calcularMutation.data && !calcularMutation.data.success && (
              <div className="p-3 text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 rounded-md dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900">
                {calcularMutation.data.error}
              </div>
            )}

            <Button
              type="submit"
              disabled={calcularMutation.isPending}
              className="w-full h-11 rounded bg-emerald-600 text-white hover:bg-emerald-700 font-semibold transition-colors mt-2"
            >
              {calcularMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculando...
                </>
              ) : (
                "Calcular Volúmenes V1 y Solvente"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Resultado: viene del store de Zustand */}
      {ultimoResultado && <ResultadoCard tipo="dilucion" resultadoDilucion={ultimoResultado} />}
    </div>
  );
}
