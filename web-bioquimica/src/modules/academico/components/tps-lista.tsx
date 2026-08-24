"use client";

import { useState } from "react";
import { TrabajoPractico, Materia, EstadoTP } from "../types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/core/components/ui/table";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { crearTrabajoPractico, cambiarEstadoTP } from "../actions";
import { Plus, FileSpreadsheet, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface TpsListaProps {
  tps: TrabajoPractico[];
  materias: Materia[];
  onRefresh: () => void;
}

export function TpsLista({ tps, materias, onRefresh }: TpsListaProps) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [materiaId, setMateriaId] = useState(materias[0]?.id || "");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [estado, setEstado] = useState<EstadoTP>("pendiente");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !fechaEntrega) {
      setError("Por favor completa el título y la fecha de entrega.");
      return;
    }

    setCargando(true);
    setError(null);

    const res = await crearTrabajoPractico({
      materia_id: materiaId || (materias[0]?.id ?? "mat-1"),
      titulo,
      descripcion,
      fecha_entrega: fechaEntrega,
      estado,
    });

    setCargando(false);

    if (res.success) {
      setTitulo("");
      setDescripcion("");
      setMostrarForm(false);
      onRefresh();
    } else {
      setError(res.error || "No se pudo crear el trabajo práctico.");
    }
  };

  const handleCambiarEstado = async (id: string, nuevoEstado: EstadoTP) => {
    await cambiarEstadoTP(id, nuevoEstado);
    onRefresh();
  };

  const getEstadoBadge = (est: EstadoTP) => {
    switch (est) {
      case "pendiente":
        return <Badge variant="warning" className="gap-1"><AlertCircle className="w-3 h-3" /> Pendiente</Badge>;
      case "en_progreso":
        return <Badge variant="default" className="gap-1"><Clock className="w-3 h-3" /> En Progreso</Badge>;
      case "entregado":
        return <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Entregado</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          Trabajos Prácticos ({tps.length})
        </h2>
        <Button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="h-10 rounded bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors sm:w-auto w-full"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          {mostrarForm ? "Cancelar" : "Nuevo TP"}
        </Button>
      </div>

      {mostrarForm && (
        <Card className="border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Registrar Trabajo Práctico de Laboratorio
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-3">
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
                    Título del Trabajo Práctico *
                  </Label>
                  <Input
                    id="titulo"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej: TP N° 4: Espectrofotometría"
                    className="h-10 bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="fechaEntrega" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Fecha Límite de Entrega *
                  </Label>
                  <Input
                    id="fechaEntrega"
                    type="date"
                    value={fechaEntrega}
                    onChange={(e) => setFechaEntrega(e.target.value)}
                    className="h-10 bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="estado" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Estado Inicial
                  </Label>
                  <select
                    id="estado"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as EstadoTP)}
                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_progreso">En Progreso</option>
                    <option value="entregado">Entregado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="descripcion" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Descripción u Objetivos del Protocolo
                </Label>
                <Input
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Detalles sobre reactivos, muestra o informe..."
                  className="h-10 bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                />
              </div>

              {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

              <Button
                type="submit"
                disabled={cargando}
                className="w-full h-10 rounded bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
              >
                {cargando ? "Guardando..." : "Crear Trabajo Práctico"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trabajo Práctico</TableHead>
              <TableHead className="hidden sm:table-cell">Materia</TableHead>
              <TableHead>Fecha Límite</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                  No hay trabajos prácticos asignados.
                </TableCell>
              </TableRow>
            ) : (
              tps.map((tp) => (
                <TableRow key={tp.id}>
                  <TableCell>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{tp.titulo}</div>
                    {tp.descripcion && (
                      <div className="text-xs text-slate-500 line-clamp-1">{tp.descripcion}</div>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {tp.materia_nombre}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {tp.fecha_entrega}
                    </span>
                  </TableCell>
                  <TableCell>{getEstadoBadge(tp.estado)}</TableCell>
                  <TableCell className="text-right">
                    <select
                      value={tp.estado}
                      onChange={(e) => handleCambiarEstado(tp.id, e.target.value as EstadoTP)}
                      className="text-xs p-1 rounded border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
                    >
                      <option value="pendiente">Marcar Pendiente</option>
                      <option value="en_progreso">Marcar En Progreso</option>
                      <option value="entregado">Marcar Entregado</option>
                    </select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
