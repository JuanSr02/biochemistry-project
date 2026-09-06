"use client";

import { useState } from "react";
import { Materia, EstadoMateria } from "../types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/core/components/ui/table";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import {
  offlineCrearMateria as crearMateria,
  offlineActualizarMateria as actualizarMateria,
  offlineEliminarMateria as eliminarMateria
} from "../lib/offline-actions";
import { Plus, BookOpen, CheckCircle, Clock, Edit2, Trash2, X } from "lucide-react";

interface MateriasListaProps {
  materias: Materia[];
  onRefresh: () => void;
}

export function MateriasLista({ materias, onRefresh }: MateriasListaProps) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [profesor, setProfesor] = useState("");
  const [periodo, setPeriodo] = useState("1º Cuatrimestre");
  const [anio, setAnio] = useState(new Date().getFullYear().toString());
  const [estado, setEstado] = useState<EstadoMateria>("cursando");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !codigo.trim()) {
      setError("Por favor completa el nombre y el código de la materia.");
      return;
    }

    setCargando(true);
    setError(null);
    let estudiante_id: string | undefined = undefined;
    try {
      const stored = localStorage.getItem("biotools_user");
      if (stored) {
        estudiante_id = JSON.parse(stored).id;
      }
    } catch (e) {
      // ignore
    }
    const cuatrimestre = `${periodo} ${anio}`;
    const payload = { nombre, codigo, profesor, cuatrimestre, estado, estudiante_id };

    let res;
    if (editandoId) {
      res = await actualizarMateria(editandoId, payload);
    } else {
      res = await crearMateria(payload);
    }
    setCargando(false);

    if (res.success) {
      setNombre("");
      setCodigo("");
      setProfesor("");
      setEditandoId(null);
      onRefresh();
    } else {
      setError(res.error || "No se pudo guardar la materia.");
    }
  };

  const handleEdit = (mat: Materia) => {
    setNombre(mat.nombre);
    setCodigo(mat.codigo);
    setProfesor(mat.profesor || "");
    const parts = mat.cuatrimestre.split(" ");
    if (parts.length >= 3) {
      setPeriodo(`${parts[0]} ${parts[1]}`);
      setAnio(parts[2]);
    } else {
      setPeriodo("1º Cuatrimestre");
      setAnio(new Date().getFullYear().toString());
    }
    setEstado(mat.estado);
    setEditandoId(mat.id);
    setMostrarForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta materia?")) {
      const res = await eliminarMateria(id);
      if (res.success) {
        onRefresh();
      } else {
        alert(res.error || "Error al eliminar");
      }
    }
  };

  const resetForm = () => {
    setNombre("");
    setCodigo("");
    setProfesor("");
    setEditandoId(null);
    setMostrarForm(false);
  };

  const getEstadoBadge = (est: EstadoMateria) => {
    switch (est) {
      case "cursando":
        return <Badge variant="default" className="gap-1"><Clock className="w-3 h-3" /> Cursando</Badge>;
      case "aprobada":
        return <Badge variant="success" className="gap-1"><CheckCircle className="w-3 h-3" /> Aprobada</Badge>;
      case "pendiente":
        return <Badge variant="secondary" className="gap-1">Pendiente</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          Materias Registradas ({materias.length})
        </h2>
        <Button
          onClick={() => {
            if (mostrarForm) resetForm();
            else setMostrarForm(true);
          }}
          className="h-10 rounded bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors sm:w-auto w-full"
        >
          {mostrarForm ? (
            <><X className="w-4 h-4 mr-1.5" /> Cancelar</>
          ) : (
            <><Plus className="w-4 h-4 mr-1.5" /> Nueva Materia</>
          )}
        </Button>
      </div>

      {mostrarForm && (
        <Card className="border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {editandoId ? "Editar Materia" : "Registrar Nueva Materia"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="nombre" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Nombre de la Materia *
                  </Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Química Bioanalítica"
                    className="h-10 bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="codigo" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Código de Cátedra *
                  </Label>
                  <Input
                    id="codigo"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Ej: QBA-301"
                    className="h-10 bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="profesor" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Profesor / Jefe de Trabajos Prácticos
                  </Label>
                  <Input
                    id="profesor"
                    value={profesor}
                    onChange={(e) => setProfesor(e.target.value)}
                    placeholder="Ej: Dr. Alberto Ginastera"
                    className="h-10 bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Periodo y Año
                  </Label>
                  <div className="flex gap-2">
                    <select
                      value={periodo}
                      onChange={(e) => setPeriodo(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="1º Cuatrimestre">1º Cuatrimestre</option>
                      <option value="2º Cuatrimestre">2º Cuatrimestre</option>
                      <option value="Anual">Anual</option>
                    </select>
                    <Input
                      type="number"
                      value={anio}
                      onChange={(e) => setAnio(e.target.value)}
                      placeholder="Año"
                      className="w-24 h-10 bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="estado" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Estado de Cursada
                  </Label>
                  <select
                    id="estado"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as EstadoMateria)}
                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="cursando">Cursando</option>
                    <option value="aprobada">Aprobada</option>
                    <option value="pendiente">Pendiente</option>
                  </select>
                </div>
              </div>

              {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

              <Button
                type="submit"
                disabled={cargando}
                className="w-full h-10 rounded bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
              >
                {cargando ? "Guardando..." : "Guardar Materia"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tabla Minimalista */}
      <Card className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden md:table-cell">Profesor</TableHead>
              <TableHead className="hidden sm:table-cell">Cuatrimestre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[100px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                  No hay materias registradas aún.
                </TableCell>
              </TableRow>
            ) : (
              materias.map((mat) => (
                <TableRow key={mat.id}>
                  <TableCell className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {mat.codigo}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                    {mat.nombre}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-slate-500 dark:text-slate-400">
                    {mat.profesor || "—"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-slate-500 dark:text-slate-400 text-xs">
                    {mat.cuatrimestre}
                  </TableCell>
                  <TableCell>{getEstadoBadge(mat.estado)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(mat)} className="h-8 w-8 text-slate-400 hover:text-emerald-600">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(mat.id)} className="h-8 w-8 text-slate-400 hover:text-rose-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
