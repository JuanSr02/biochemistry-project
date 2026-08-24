"use client";

import { useState } from "react";
import { Laboratorio, Materia, EstadoLaboratorio } from "../types";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/core/components/ui/card";
import { crearLaboratorio, toggleTareaLaboratorio, cambiarEstadoLaboratorio } from "../actions";
import { Plus, FlaskConical, Calendar, CheckSquare, Square, Trash2, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface LaboratoriosListaProps {
  laboratorios: Laboratorio[];
  materias: Materia[];
  onRefresh: () => void;
}

export function LaboratoriosLista({ laboratorios, materias, onRefresh }: LaboratoriosListaProps) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [materiaId, setMateriaId] = useState(materias[0]?.id || "");
  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [observaciones, setObservaciones] = useState("");
  const [tareasIniciales, setTareasIniciales] = useState<string[]>([
    "Armado de pipetas y calibración de pH-metro",
    "Preparación de soluciones y muestras",
    "Medición espectrofotométrica / Titulación",
    "Limpieza y guardado de material de vidrio",
  ]);
  const [nuevaTareaTexto, setNuevaTareaTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAgregarTareaInput = () => {
    if (nuevaTareaTexto.trim()) {
      setTareasIniciales([...tareasIniciales, nuevaTareaTexto.trim()]);
      setNuevaTareaTexto("");
    }
  };

  const handleEliminarTareaInput = (idx: number) => {
    setTareasIniciales(tareasIniciales.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !fecha) {
      setError("Por favor ingresa el título y la fecha del laboratorio.");
      return;
    }

    setCargando(true);
    setError(null);

    const res = await crearLaboratorio({
      materia_id: materiaId || (materias[0]?.id ?? "mat-1"),
      titulo,
      fecha,
      observaciones,
      tareasIniciales,
    });

    setCargando(false);

    if (res.success) {
      setTitulo("");
      setObservaciones("");
      setMostrarForm(false);
      onRefresh();
    } else {
      setError(res.error || "No se pudo crear la sesión de laboratorio.");
    }
  };

  const handleToggleTarea = async (labId: string, tareaId: string) => {
    await toggleTareaLaboratorio(labId, tareaId);
    onRefresh();
  };

  const getEstadoBadge = (est: EstadoLaboratorio) => {
    switch (est) {
      case "pendiente":
        return <Badge variant="warning" className="gap-1"><AlertCircle className="w-3 h-3" /> Pendiente</Badge>;
      case "en_progreso":
        return <Badge variant="default" className="gap-1"><Clock className="w-3 h-3" /> En Progreso</Badge>;
      case "completado":
        return <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Completado</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-emerald-600" />
          Sesiones de Laboratorio ({laboratorios.length})
        </h2>
        <Button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="h-10 rounded bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors sm:w-auto w-full"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          {mostrarForm ? "Cancelar" : "Nuevo Laboratorio"}
        </Button>
      </div>

      {mostrarForm && (
        <Card className="border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Registrar Nueva Sesión de Laboratorio
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Define el protocolo práctico y el checklist de tareas obligatorias en mesada.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="materiaId" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Materia Asignada *
                  </Label>
                  <select
                    id="materiaId"
                    value={materiaId}
                    onChange={(e) => setMateriaId(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {materias.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre} ({m.codigo})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="titulo" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Título de la SesiónPráctica *
                  </Label>
                  <Input
                    id="titulo"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej: Titulación Potenciométrica de Aminoácidos"
                    className="h-10 bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="fecha" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Fecha del Laboratorio *
                  </Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="h-10 bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="observaciones" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Observaciones / Reactivos Específicos
                  </Label>
                  <Input
                    id="observaciones"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Ej: Llevar pipeta automática P1000 y frasco lavador"
                    className="h-10 bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                  />
                </div>
              </div>

              {/* Tareas Checklist Manager */}
              <div className="space-y-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/60">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Tareas / Checklist de Mesada de Laboratorio
                </Label>
                <div className="space-y-1.5">
                  {tareasIniciales.map((task, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 text-xs bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-700 dark:text-slate-300">
                        {idx + 1}. {task}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleEliminarTareaInput(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <Input
                    value={nuevaTareaTexto}
                    onChange={(e) => setNuevaTareaTexto(e.target.value)}
                    placeholder="Añadir nueva tarea..."
                    className="h-9 text-xs bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                  />
                  <Button
                    type="button"
                    onClick={handleAgregarTareaInput}
                    variant="outline"
                    className="h-9 px-3 text-xs"
                  >
                    Agregar Tarea
                  </Button>
                </div>
              </div>

              {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

              <Button
                type="submit"
                disabled={cargando}
                className="w-full h-10 rounded bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
              >
                {cargando ? "Guardando..." : "Crear Sesión de Laboratorio"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Grid de Tarjetas de Laboratorio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {laboratorios.length === 0 ? (
          <Card className="col-span-2 p-8 text-center border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500">
            No hay sesiones de laboratorio programadas.
          </Card>
        ) : (
          laboratorios.map((lab) => {
            const completadas = lab.tareas.filter((t) => t.completada).length;
            const total = lab.tareas.length;
            const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;

            return (
              <Card
                key={lab.id}
                className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      {lab.materia_nombre}
                    </span>
                    {getEstadoBadge(lab.estado)}
                  </div>
                  <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug mt-1">
                    {lab.titulo}
                  </CardTitle>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Fecha: {lab.fecha}</span>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-3 flex-1">
                  {lab.observaciones && (
                    <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">💡 Observaciones:</span>
                      {lab.observaciones}
                    </div>
                  )}

                  {/* Barra de Progreso */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                      <span>Checklist de Mesada</span>
                      <span>
                        {completadas} / {total} ({porcentaje}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full transition-all duration-300"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>

                  {/* Checklist Interactivo */}
                  <div className="space-y-1.5 pt-1">
                    {lab.tareas.map((tarea) => (
                      <button
                        key={tarea.id}
                        type="button"
                        onClick={() => handleToggleTarea(lab.id, tarea.id)}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-md text-xs text-left transition-colors border ${
                          tarea.completada
                            ? "bg-emerald-50/50 text-slate-500 border-emerald-200/60 line-through dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-slate-400"
                            : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        {tarea.completada ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        )}
                        <span className="leading-snug">{tarea.descripcion}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
