"use client";

import { useState } from "react";
import { TarjetaEstudio } from "../types";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Check, X, RotateCw, HelpCircle, Sparkles } from "lucide-react";

interface FlashcardItemProps {
  tarjeta: TarjetaEstudio;
  onResponder: (sabias: boolean) => void;
}

export function FlashcardItem({ tarjeta, onResponder }: FlashcardItemProps) {
  const [flipped, setFlipped] = useState(false);

  const getDificultadBadge = (dif: string) => {
    switch (dif) {
      case "facil":
        return <Badge variant="success">Fácil</Badge>;
      case "media":
        return <Badge variant="warning">Media</Badge>;
      case "dificil":
        return <Badge variant="destructive">Difícil</Badge>;
    }
  };

  const handleRespuesta = (e: React.MouseEvent, sabias: boolean) => {
    e.stopPropagation();
    setFlipped(false);
    onResponder(sabias);
  };

  return (
    <div className="w-full max-w-lg mx-auto perspective-1000">
      <div
        onClick={() => setFlipped(!flipped)}
        className={`relative w-full min-h-[320px] rounded-2xl border cursor-pointer transition-all duration-500 transform-style-3d shadow-md hover:shadow-xl ${
          flipped ? "rotate-y-180" : ""
        } ${
          flipped
            ? "border-emerald-300 bg-emerald-50/90 dark:border-emerald-800 dark:bg-emerald-950/70"
            : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        }`}
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* CARA FRONTAL: Pregunta */}
        <div
          className="absolute inset-0 p-6 flex flex-col justify-between backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {tarjeta.categoria}
              </span>
              {getDificultadBadge(tarjeta.nivel_dificultad)}
            </div>

            <span className="text-xs text-slate-400 block mb-2 font-medium">
              {tarjeta.materia_nombre}
            </span>

            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50 leading-relaxed mt-2">
              {tarjeta.pregunta}
            </h3>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <RotateCw className="w-3.5 h-3.5" /> Haz clic en la tarjeta para voltear
            </span>
            <Badge variant="secondary" className="capitalize text-[10px]">
              {tarjeta.estado_repaso}
            </Badge>
          </div>
        </div>

        {/* CARA POSTERIOR: Respuesta */}
        <div
          className="absolute inset-0 p-6 flex flex-col justify-between backface-hidden rotate-y-180"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                <HelpCircle className="w-4 h-4" /> Respuesta Explicada
              </span>
              <Badge variant="outline" className="text-xs">
                {tarjeta.categoria}
              </Badge>
            </div>

            <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-normal mt-2">
              {tarjeta.respuesta}
            </p>
          </div>

          {/* Botones de Retroalimentación de Repaso Espaciado */}
          <div className="pt-4 border-t border-emerald-200/80 dark:border-emerald-900/60 flex gap-3">
            <Button
              type="button"
              onClick={(e) => handleRespuesta(e, false)}
              variant="destructive"
              className="flex-1 h-11 text-xs font-semibold rounded-lg shadow-sm"
            >
              <X className="w-4 h-4 mr-1.5" />
              No lo sabía
            </Button>
            <Button
              type="button"
              onClick={(e) => handleRespuesta(e, true)}
              className="flex-1 h-11 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <Check className="w-4 h-4 mr-1.5" />
              ¡Lo sabía!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
