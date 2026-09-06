"use server";

import { createClient } from "@/core/lib/supabase/server";
import { isSupabaseConfigured } from "@/core/lib/supabase/utils";
import {
  Materia,
  TrabajoPractico,
  Laboratorio,
  TareaLaboratorio,
  CrearMateriaInput,
  CrearTrabajoPracticoInput,
  CrearLaboratorioInput,
  EstadoTP,
  EstadoLaboratorio,
} from "./types";

// MOCK DATA FALLBACK (para cuando la BD no esté conectada o en modo offline)
let MOCK_MATERIAS: Materia[] = [
  {
    id: "mat-1",
    nombre: "Química Biológica I",
    codigo: "QB-201",
    profesor: "Dr. Roberto Gómez",
    cuatrimestre: "1º Cuatrimestre 2026",
    estado: "cursando",
    created_at: new Date().toISOString(),
    created_by: "00000000-0000-0000-0000-000000000001",
    updated_at: new Date().toISOString(),
    updated_by: "00000000-0000-0000-0000-000000000001",
  },
  {
    id: "mat-2",
    nombre: "Enzimología Aplicada",
    codigo: "ENZ-302",
    profesor: "Dra. María Elena Walsh",
    cuatrimestre: "1º Cuatrimestre 2026",
    estado: "cursando",
    created_at: new Date().toISOString(),
    created_by: "00000000-0000-0000-0000-000000000001",
    updated_at: new Date().toISOString(),
    updated_by: "00000000-0000-0000-0000-000000000001",
  },
  {
    id: "mat-3",
    nombre: "Biología Molecular y Genética",
    codigo: "BMG-104",
    profesor: "Dr. Carlos Saavedra",
    cuatrimestre: "2º Cuatrimestre 2025",
    estado: "aprobada",
    created_at: new Date().toISOString(),
    created_by: "00000000-0000-0000-0000-000000000001",
    updated_at: new Date().toISOString(),
    updated_by: "00000000-0000-0000-0000-000000000001",
  },
];

let MOCK_TRABAJOS_PRACTICOS: TrabajoPractico[] = [
  {
    id: "tp-1",
    materia_id: "mat-1",
    materia_nombre: "Química Biológica I",
    titulo: "TP N° 3: Cuantificación de Proteínas por Método de Bradford",
    descripcion: "Construcción de curva de calibración con BSA y determinación de muestra problema.",
    fecha_entrega: "2026-09-02",
    estado: "pendiente",
    created_at: new Date().toISOString(),
    created_by: "00000000-0000-0000-0000-000000000001",
    updated_at: new Date().toISOString(),
    updated_by: "00000000-0000-0000-0000-000000000001",
  },
  {
    id: "tp-2",
    materia_id: "mat-2",
    materia_nombre: "Enzimología Aplicada",
    titulo: "TP N° 2: Cinética Enzimática de la Fosfatasa Alcalina",
    descripcion: "Determinación de Km y Vmáx usando representaciones de Lineweaver-Burk.",
    fecha_entrega: "2026-09-10",
    estado: "en_progreso",
    created_at: new Date().toISOString(),
    created_by: "00000000-0000-0000-0000-000000000001",
    updated_at: new Date().toISOString(),
    updated_by: "00000000-0000-0000-0000-000000000001",
  },
];

let MOCK_LABORATORIOS: Laboratorio[] = [
  {
    id: "lab-1",
    materia_id: "mat-1",
    materia_nombre: "Química Biológica I",
    titulo: "Sesión 4: Extracción y Precipitación Isoeléctrica de Caseína",
    fecha: "2026-08-28",
    observaciones: "Usar guardapolvo blanco y antiparras obligatorias. Llevar matraz de 250 mL.",
    estado: "en_progreso",
    created_at: new Date().toISOString(),
    created_by: "00000000-0000-0000-0000-000000000001",
    updated_at: new Date().toISOString(),
    updated_by: "00000000-0000-0000-0000-000000000001",
    tareas: [
      {
        id: "tar-1",
        laboratorio_id: "lab-1",
        descripcion: "Armado de pipetas y calibración de pH-metro con buffer 4 y 7",
        completada: true,
        orden: 1,
        created_at: new Date().toISOString(),
        created_by: "00000000-0000-0000-0000-000000000001",
        updated_at: new Date().toISOString(),
        updated_by: "00000000-0000-0000-0000-000000000001",
      },
      {
        id: "tar-2",
        laboratorio_id: "lab-1",
        descripcion: "Preparación de alícuotas de leche descremada a 40°C",
        completada: true,
        orden: 2,
        created_at: new Date().toISOString(),
        created_by: "00000000-0000-0000-0000-000000000001",
        updated_at: new Date().toISOString(),
        updated_by: "00000000-0000-0000-0000-000000000001",
      },
      {
        id: "tar-3",
        laboratorio_id: "lab-1",
        descripcion: "Adición gota a gota de ácido acético 1M hasta pH 4.6 (punto isoeléctrico)",
        completada: false,
        orden: 3,
        created_at: new Date().toISOString(),
        created_by: "00000000-0000-0000-0000-000000000001",
        updated_at: new Date().toISOString(),
        updated_by: "00000000-0000-0000-0000-000000000001",
      },
      {
        id: "tar-4",
        laboratorio_id: "lab-1",
        descripcion: "Filtración en papel de filtro pre-pesado y secado en estufa a 60°C",
        completada: false,
        orden: 4,
        created_at: new Date().toISOString(),
        created_by: "00000000-0000-0000-0000-000000000001",
        updated_at: new Date().toISOString(),
        updated_by: "00000000-0000-0000-0000-000000000001",
      },
    ],
  },
];

// ==============================================================================
// MATERIAS ACTIONS
// ==============================================================================
export async function getMaterias(estudianteId?: string): Promise<{ success: boolean; data: Materia[]; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      let query = supabase.from("materias").select("*");
      if (estudianteId) {
        query = query.eq("estudiante_id", estudianteId);
      }
      const { data, error } = await query.order("created_at", { ascending: false });

      if (!error && data) {
        return { success: true, data: data as Materia[] };
      }
      if (error) {

        return { success: false, error: error.message, data: [] };
      }
    } catch (e: any) {

      return { success: false, error: e.message || "Error de red", data: [] };
    }
  }

  let materiasResult = [...MOCK_MATERIAS];
  if (estudianteId) {
    materiasResult = materiasResult.filter(m => !m.estudiante_id || m.estudiante_id === estudianteId);
  }
  return { success: true, data: materiasResult };
}

export async function crearMateria(
  input: CrearMateriaInput
): Promise<{ success: boolean; data?: Materia; error?: string }> {
  if (!input.nombre.trim() || !input.codigo.trim()) {
    return { success: false, error: "El nombre y código de materia son obligatorios." };
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("materias")
        .insert({
          nombre: input.nombre.trim(),
          codigo: input.codigo.trim(),
          profesor: input.profesor?.trim() || null,
          cuatrimestre: input.cuatrimestre.trim() || "1º Cuatrimestre",
          estado: input.estado,
          estudiante_id: input.estudiante_id,
          created_by: input.estudiante_id,
          updated_by: input.estudiante_id,
        })
        .select()
        .single();

      if (!error && data) {
        return { success: true, data: data as Materia };
      }
      if (error) {

        return { success: false, error: error.message };
      }
    } catch (e: any) {

      return { success: false, error: e.message || "Error de red" };
    }
  }

  const nuevaMateria: Materia = {
    id: `mat-${Date.now()}`,
    nombre: input.nombre.trim(),
    codigo: input.codigo.trim(),
    profesor: input.profesor?.trim() || undefined,
    cuatrimestre: input.cuatrimestre.trim() || "1º Cuatrimestre",
    estado: input.estado,
    estudiante_id: input.estudiante_id,
    created_at: new Date().toISOString(),
    created_by: input.estudiante_id || "00000000-0000-0000-0000-000000000001",
    updated_at: new Date().toISOString(),
    updated_by: input.estudiante_id || "00000000-0000-0000-0000-000000000001",
  };

  MOCK_MATERIAS.unshift(nuevaMateria);
  return { success: true, data: nuevaMateria };
}

export async function actualizarMateria(id: string, input: import("./types").ActualizarMateriaInput): Promise<{ success: boolean; data?: Materia; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const updatePayload = { ...input, updated_by: input.estudiante_id };
      const { data, error } = await supabase.from("materias").update(updatePayload).eq("id", id).select().single();
      if (!error && data) return { success: true, data: data as Materia };
      if (error) return { success: false, error: error.message };
    } catch (e: any) {
      return { success: false, error: e.message || "Error de red" };
    }
  }
  const idx = MOCK_MATERIAS.findIndex(m => m.id === id);
  if (idx !== -1) {
    MOCK_MATERIAS[idx] = { ...MOCK_MATERIAS[idx], ...input, updated_at: new Date().toISOString() } as Materia;
    return { success: true, data: MOCK_MATERIAS[idx] };
  }
  return { success: false, error: "No encontrada" };
}

export async function eliminarMateria(id: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("materias").delete().eq("id", id);
      if (!error) return { success: true };
      return { success: false, error: error.message };
    } catch (e: any) {
      return { success: false, error: e.message || "Error de red" };
    }
  }
  const idx = MOCK_MATERIAS.findIndex(m => m.id === id);
  if (idx !== -1) {
    MOCK_MATERIAS.splice(idx, 1);
    return { success: true };
  }
  return { success: false, error: "No encontrada" };
}

// ==============================================================================
// TRABAJOS PRÁCTICOS ACTIONS
// ==============================================================================
export async function getTrabajosPracticos(estudianteId?: string): Promise<{ success: boolean; data: TrabajoPractico[]; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      let query = supabase.from("trabajos_practicos").select("*, materias(nombre)");
      if (estudianteId) {
        query = query.eq("estudiante_id", estudianteId);
      }
      const { data, error } = await query.order("fecha_entrega", { ascending: true });

      if (!error && data) {
        const formatted = data.map((item: any) => ({
          ...item,
          materia_nombre: item.materias?.nombre || "General",
        }));
        return { success: true, data: formatted as TrabajoPractico[] };
      }
    } catch {
    }
  }

  let tpsResult = [...MOCK_TRABAJOS_PRACTICOS];
  if (estudianteId) {
    tpsResult = tpsResult.filter(t => !t.estudiante_id || t.estudiante_id === estudianteId);
  }
  return { success: true, data: tpsResult };
}

export async function crearTrabajoPractico(
  input: CrearTrabajoPracticoInput
): Promise<{ success: boolean; data?: TrabajoPractico; error?: string }> {
  if (!input.titulo.trim() || !input.fecha_entrega) {
    return { success: false, error: "El título y la fecha de entrega son obligatorios." };
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("trabajos_practicos")
        .insert({
          materia_id: input.materia_id,
          titulo: input.titulo.trim(),
          descripcion: input.descripcion?.trim() || null,
          fecha_entrega: input.fecha_entrega,
          estado: input.estado,
          calificacion: input.calificacion || null,
          estudiante_id: input.estudiante_id,
          created_by: input.estudiante_id,
          updated_by: input.estudiante_id,
        })
        .select("*, materias(nombre)")
        .single();

      if (!error && data) {
        return {
          success: true,
          data: { ...data, materia_nombre: (data as any).materias?.nombre || "General" },
        };
      }
      if (error) {

        return { success: false, error: error.message };
      }
    } catch (e: any) {

      return { success: false, error: e.message || "Error de red" };
    }
  }

  const materia = MOCK_MATERIAS.find((m) => m.id === input.materia_id);
  const nuevoTP: TrabajoPractico = {
    id: `tp-${Date.now()}`,
    materia_id: input.materia_id,
    materia_nombre: materia ? materia.nombre : "General",
    titulo: input.titulo.trim(),
    descripcion: input.descripcion?.trim() || undefined,
    fecha_entrega: input.fecha_entrega,
    estado: input.estado,
    calificacion: input.calificacion,
    estudiante_id: input.estudiante_id,
    created_at: new Date().toISOString(),
    created_by: input.estudiante_id || "00000000-0000-0000-0000-000000000001",
    updated_at: new Date().toISOString(),
    updated_by: input.estudiante_id || "00000000-0000-0000-0000-000000000001",
  };

  MOCK_TRABAJOS_PRACTICOS.unshift(nuevoTP);
  return { success: true, data: nuevoTP };
}

export async function cambiarEstadoTP(
  id: string,
  nuevoEstado: EstadoTP,
  estudianteId?: string
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("trabajos_practicos")
        .update({ estado: nuevoEstado, updated_by: estudianteId })
        .eq("id", id);

      if (!error) return { success: true };
    } catch {
    }
  }

  const tpIndex = MOCK_TRABAJOS_PRACTICOS.findIndex((tp) => tp.id === id);
  if (tpIndex !== -1) {
    MOCK_TRABAJOS_PRACTICOS[tpIndex].estado = nuevoEstado;
    MOCK_TRABAJOS_PRACTICOS[tpIndex].updated_at = new Date().toISOString();
  }
  return { success: true };
}

export async function actualizarTrabajoPractico(id: string, input: import("./types").ActualizarTrabajoPracticoInput): Promise<{ success: boolean; data?: TrabajoPractico; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const updatePayload = { ...input, updated_by: input.estudiante_id };
      const { data, error } = await supabase.from("trabajos_practicos").update(updatePayload).eq("id", id).select("*, materias(nombre)").single();
      if (!error && data) return { success: true, data: { ...data, materia_nombre: (data as any).materias?.nombre || "General" } as TrabajoPractico };
      if (error) return { success: false, error: error.message };
    } catch (e: any) {
      return { success: false, error: e.message || "Error de red" };
    }
  }
  const idx = MOCK_TRABAJOS_PRACTICOS.findIndex(t => t.id === id);
  if (idx !== -1) {
    let materiaNombre = MOCK_TRABAJOS_PRACTICOS[idx].materia_nombre;
    if (input.materia_id) {
      const materia = MOCK_MATERIAS.find(m => m.id === input.materia_id);
      if (materia) materiaNombre = materia.nombre;
    }
    MOCK_TRABAJOS_PRACTICOS[idx] = { ...MOCK_TRABAJOS_PRACTICOS[idx], ...input, materia_nombre: materiaNombre, updated_at: new Date().toISOString() } as TrabajoPractico;
    return { success: true, data: MOCK_TRABAJOS_PRACTICOS[idx] };
  }
  return { success: false, error: "No encontrado" };
}

export async function eliminarTrabajoPractico(id: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("trabajos_practicos").delete().eq("id", id);
      if (!error) return { success: true };
      return { success: false, error: error.message };
    } catch (e: any) {
      return { success: false, error: e.message || "Error de red" };
    }
  }
  const idx = MOCK_TRABAJOS_PRACTICOS.findIndex(t => t.id === id);
  if (idx !== -1) {
    MOCK_TRABAJOS_PRACTICOS.splice(idx, 1);
    return { success: true };
  }
  return { success: false, error: "No encontrado" };
}

// ==============================================================================
// LABORATORIOS & TAREAS ACTIONS
// ==============================================================================
export async function getLaboratorios(estudianteId?: string): Promise<{ success: boolean; data: Laboratorio[]; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      let query = supabase.from("laboratorios").select("*, materias(nombre), tareas_laboratorio(*)");
      if (estudianteId) {
        query = query.eq("estudiante_id", estudianteId);
      }
      const { data, error } = await query.order("fecha", { ascending: true });

      if (!error && data) {
        const formatted = data.map((lab: any) => ({
          ...lab,
          materia_nombre: lab.materias?.nombre || "Bioquímica General",
          tareas: (lab.tareas_laboratorio || []).sort((a: any, b: any) => a.orden - b.orden),
        }));
        return { success: true, data: formatted };
      }
    } catch {
    }
  }

  let labsResult = [...MOCK_LABORATORIOS];
  if (estudianteId) {
    labsResult = labsResult.filter(l => !l.estudiante_id || l.estudiante_id === estudianteId);
  }
  return { success: true, data: labsResult };
}

export async function crearLaboratorio(
  input: CrearLaboratorioInput
): Promise<{ success: boolean; data?: Laboratorio; error?: string }> {
  if (!input.titulo.trim() || !input.fecha) {
    return { success: false, error: "El título y fecha de la sesión son obligatorios." };
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      // 1. Insertar el laboratorio
      const { data: labData, error: labError } = await supabase
        .from("laboratorios")
        .insert({
          materia_id: input.materia_id,
          titulo: input.titulo.trim(),
          fecha: input.fecha,
          observaciones: input.observaciones?.trim() || null,
          estado: "pendiente",
          estudiante_id: input.estudiante_id,
          created_by: input.estudiante_id,
          updated_by: input.estudiante_id,
        })
        .select("*, materias(nombre)")
        .single();

      if (!labError && labData) {
        // 2. Insertar las tareas iniciales
        const tareasPayload = input.tareasIniciales
          .filter((t) => t.trim().length > 0)
          .map((desc, idx) => ({
            laboratorio_id: labData.id,
            descripcion: desc.trim(),
            completada: false,
            orden: idx + 1,
            estudiante_id: input.estudiante_id,
            created_by: input.estudiante_id,
            updated_by: input.estudiante_id,
          }));

        let tareasResult: TareaLaboratorio[] = [];
        if (tareasPayload.length > 0) {
          const { data: tData } = await supabase
            .from("tareas_laboratorio")
            .insert(tareasPayload)
            .select();
          if (tData) tareasResult = tData;
        }

        return {
          success: true,
          data: {
            ...labData,
            materia_nombre: (labData as any).materias?.nombre || "Bioquímica General",
            tareas: tareasResult,
          },
        };
      }
      if (labError) {

        return { success: false, error: labError.message };
      }
    } catch (e: any) {

      return { success: false, error: e.message || "Error de red" };
    }
  }

  const materia = MOCK_MATERIAS.find((m) => m.id === input.materia_id);
  const labId = `lab-${Date.now()}`;

  const tareas: TareaLaboratorio[] = input.tareasIniciales
    .filter((t) => t.trim().length > 0)
    .map((desc, idx) => ({
      id: `tar-${Date.now()}-${idx}`,
      laboratorio_id: labId,
      descripcion: desc.trim(),
      completada: false,
      orden: idx + 1,
      created_at: new Date().toISOString(),
      created_by: "00000000-0000-0000-0000-000000000001",
      updated_at: new Date().toISOString(),
      updated_by: "00000000-0000-0000-0000-000000000001",
    }));

  const nuevoLab: Laboratorio = {
    id: labId,
    materia_id: input.materia_id,
    materia_nombre: materia ? materia.nombre : "Bioquímica General",
    titulo: input.titulo.trim(),
    fecha: input.fecha,
    observaciones: input.observaciones?.trim() || undefined,
    estado: "pendiente",
    tareas,
    estudiante_id: input.estudiante_id,
    created_at: new Date().toISOString(),
    created_by: input.estudiante_id || "00000000-0000-0000-0000-000000000001",
    updated_at: new Date().toISOString(),
    updated_by: input.estudiante_id || "00000000-0000-0000-0000-000000000001",
  };

  MOCK_LABORATORIOS.unshift(nuevoLab);
  return { success: true, data: nuevoLab };
}

export async function toggleTareaLaboratorio(
  laboratorioId: string,
  tareaId: string,
  estudianteId?: string
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      // 1. Obtener estado actual de la tarea
      const { data: tarea } = await supabase
        .from("tareas_laboratorio")
        .select("completada")
        .eq("id", tareaId)
        .single();

      if (tarea) {
        // 2. Alternar
        await supabase
          .from("tareas_laboratorio")
          .update({ completada: !tarea.completada, updated_by: estudianteId })
          .eq("id", tareaId);

        return { success: true };
      }
    } catch {
    }
  }

  const lab = MOCK_LABORATORIOS.find((l) => l.id === laboratorioId);
  if (lab) {
    const tarea = lab.tareas.find((t) => t.id === tareaId);
    if (tarea) {
      tarea.completada = !tarea.completada;
      tarea.updated_at = new Date().toISOString();
      const total = lab.tareas.length;
      const completadas = lab.tareas.filter((t) => t.completada).length;
      if (completadas === total && total > 0) lab.estado = "completado";
      else if (completadas > 0) lab.estado = "en_progreso";
      else lab.estado = "pendiente";
    }
  }
  return { success: true };
}

export async function cambiarEstadoLaboratorio(
  id: string,
  nuevoEstado: EstadoLaboratorio,
  estudianteId?: string
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("laboratorios")
        .update({ estado: nuevoEstado, updated_by: estudianteId })
        .eq("id", id);
      if (!error) return { success: true };
    } catch {
    }
  }

  const lab = MOCK_LABORATORIOS.find((l) => l.id === id);
  if (lab) {
    lab.estado = nuevoEstado;
    lab.updated_at = new Date().toISOString();
  }
  return { success: true };
}

export async function actualizarLaboratorio(id: string, input: import("./types").ActualizarLaboratorioInput): Promise<{ success: boolean; data?: Laboratorio; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const payload: any = {};
      if (input.titulo) payload.titulo = input.titulo.trim();
      if (input.fecha) payload.fecha = input.fecha;
      if (input.observaciones !== undefined) payload.observaciones = input.observaciones?.trim() || null;
      if (input.materia_id) payload.materia_id = input.materia_id;
      if (input.estudiante_id) payload.updated_by = input.estudiante_id;

      const { data, error } = await supabase.from("laboratorios").update(payload).eq("id", id).select("*, materias(nombre)").single();
      if (!error && data) return { success: true, data: { ...data, materia_nombre: (data as any).materias?.nombre || "General" } as Laboratorio };
      if (error) return { success: false, error: error.message };
    } catch (e: any) {
      return { success: false, error: e.message || "Error de red" };
    }
  }
  const idx = MOCK_LABORATORIOS.findIndex(l => l.id === id);
  if (idx !== -1) {
    let materiaNombre = MOCK_LABORATORIOS[idx].materia_nombre;
    if (input.materia_id) {
      const materia = MOCK_MATERIAS.find(m => m.id === input.materia_id);
      if (materia) materiaNombre = materia.nombre;
    }
    MOCK_LABORATORIOS[idx] = { ...MOCK_LABORATORIOS[idx], ...input, materia_nombre: materiaNombre, updated_at: new Date().toISOString() } as Laboratorio;
    return { success: true, data: MOCK_LABORATORIOS[idx] };
  }
  return { success: false, error: "No encontrado" };
}

export async function eliminarLaboratorio(id: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("laboratorios").delete().eq("id", id);
      if (!error) return { success: true };
      return { success: false, error: error.message };
    } catch (e: any) {
      return { success: false, error: e.message || "Error de red" };
    }
  }
  const idx = MOCK_LABORATORIOS.findIndex(l => l.id === id);
  if (idx !== -1) {
    MOCK_LABORATORIOS.splice(idx, 1);
    return { success: true };
  }
  return { success: false, error: "No encontrado" };
}
