"use client";

import { useState } from "react";
import { TarjetaEstudio, CrearFlashcardInput, ActualizarFlashcardInput, NivelDificultad } from "../types";
import {
  offlineCrearFlashcard as crearFlashcard,
  offlineActualizarFlashcard as actualizarFlashcard,
  offlineEliminarFlashcard as eliminarFlashcard
} from "../lib/offline-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Plus, Edit2, Trash2, X, Check, Save } from "lucide-react";

export function FlashcardsLista({ 
  tarjetas, 
  materias,
  onUpdate 
}: { 
  tarjetas: TarjetaEstudio[], 
  materias: import("@/modules/academico/types").Materia[],
  onUpdate: () => void 
}) {
  const [creando, setCreando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<CrearFlashcardInput>({
    categoria: "",
    pregunta: "",
    respuesta: "",
    nivel_dificultad: "media",
    materia_id: materias[0]?.id
  });

  const resetForm = () => {
    setForm({ categoria: "", pregunta: "", respuesta: "", nivel_dificultad: "media", materia_id: materias[0]?.id });
    setCreando(false);
    setEditandoId(null);
  };

  const iniciarEdicion = (t: TarjetaEstudio) => {
    setForm({
      categoria: t.categoria,
      pregunta: t.pregunta,
      respuesta: t.respuesta,
      nivel_dificultad: t.nivel_dificultad,
      materia_id: t.materia_id
    });
    setEditandoId(t.id);
    setCreando(false);
  };

  const handleGuardar = async () => {
    let estudiante_id: string | undefined = undefined;
    try {
      const stored = localStorage.getItem("biotools_user");
      if (stored) {
        estudiante_id = JSON.parse(stored).id;
      }
    } catch (e) {
      // ignore
    }

    const payload = { ...form, estudiante_id };

    if (editandoId) {
      await actualizarFlashcard(editandoId, payload as ActualizarFlashcardInput);
    } else {
      await crearFlashcard(payload);
    }
    resetForm();
    onUpdate();
  };

  const handleEliminar = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta flashcard?")) {
      await eliminarFlashcard(id);
      onUpdate();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Mazo de Estudio</h2>
        {!creando && !editandoId && (
          <Button onClick={() => {
            setForm(prev => ({ ...prev, materia_id: materias[0]?.id }));
            setCreando(true);
          }} className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-xs">
            <Plus className="w-4 h-4 mr-2" /> Nueva Tarjeta
          </Button>
        )}
      </div>

      {(creando || editandoId) && (
        <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              {editandoId ? "Editar Tarjeta" : "Crear Nueva Tarjeta"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Mazo / Materia</Label>
                <select 
                  className="w-full h-8 px-3 rounded-md border border-slate-200 bg-white text-xs dark:border-slate-800 dark:bg-slate-900"
                  value={form.materia_id || ""}
                  onChange={(e) => setForm({...form, materia_id: e.target.value})}
                >
                  <option value="">Sin Materia (General)</option>
                  {materias.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Categoría (Tema)</Label>
                <Input 
                  value={form.categoria} 
                  onChange={(e) => setForm({...form, categoria: e.target.value})} 
                  placeholder="Ej: Vías Metabólicas" 
                  className="h-8 text-xs bg-white dark:bg-slate-900"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Dificultad</Label>
                <select 
                  className="w-full h-8 px-3 rounded-md border border-slate-200 bg-white text-xs dark:border-slate-800 dark:bg-slate-900"
                  value={form.nivel_dificultad}
                  onChange={(e) => setForm({...form, nivel_dificultad: e.target.value as NivelDificultad})}
                >
                  <option value="facil">Fácil</option>
                  <option value="media">Media</option>
                  <option value="dificil">Difícil</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs">Pregunta</Label>
              <Input 
                value={form.pregunta} 
                onChange={(e) => setForm({...form, pregunta: e.target.value})} 
                placeholder="Escribe la pregunta..." 
                className="h-8 text-xs bg-white dark:bg-slate-900"
              />
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs">Respuesta</Label>
              <textarea 
                value={form.respuesta} 
                onChange={(e) => setForm({...form, respuesta: e.target.value})} 
                placeholder="Escribe la respuesta detallada..." 
                className="w-full min-h-[60px] p-2 rounded-md border border-slate-200 bg-white text-xs dark:border-slate-800 dark:bg-slate-900 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={resetForm} variant="ghost" className="h-8 text-xs">
                <X className="w-4 h-4 mr-1" /> Cancelar
              </Button>
              <Button onClick={handleGuardar} className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs text-white">
                <Save className="w-4 h-4 mr-1" /> Guardar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {tarjetas.length === 0 ? (
          <p className="text-sm text-slate-500 italic py-4 text-center">No hay tarjetas en el mazo.</p>
        ) : (
          tarjetas.map((t) => (
            <Card key={t.id} className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-4 flex justify-between items-start gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold tracking-wider text-emerald-600 uppercase bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
                      {t.categoria}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">Nivel: {t.nivel_dificultad}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.pregunta}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{t.respuesta}</p>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row">
                  <Button onClick={() => iniciarEdicion(t)} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-emerald-600">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => handleEliminar(t.id)} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
