export type EstadoMateria = "cursando" | "aprobada" | "pendiente";
export type EstadoTP = "pendiente" | "en_progreso" | "entregado";
export type EstadoLaboratorio = "pendiente" | "en_progreso" | "completado";

export interface Materia {
  id: string;
  nombre: string;
  codigo: string;
  profesor?: string;
  cuatrimestre: string;
  estado: EstadoMateria;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  estudiante_id?: string;
}

export interface TrabajoPractico {
  id: string;
  materia_id: string;
  materia_nombre: string;
  titulo: string;
  descripcion?: string;
  fecha_entrega: string;
  estado: EstadoTP;
  calificacion?: number;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  estudiante_id?: string;
}

export interface TareaLaboratorio {
  id: string;
  laboratorio_id: string;
  descripcion: string;
  completada: boolean;
  orden: number;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export interface Laboratorio {
  id: string;
  materia_id: string;
  materia_nombre: string;
  titulo: string;
  fecha: string;
  observaciones?: string;
  estado: EstadoLaboratorio;
  tareas: TareaLaboratorio[];
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  estudiante_id?: string;
}

export interface CrearMateriaInput {
  nombre: string;
  codigo: string;
  profesor?: string;
  cuatrimestre: string;
  estado: EstadoMateria;
  estudiante_id?: string;
}

export interface CrearTrabajoPracticoInput {
  materia_id: string;
  titulo: string;
  descripcion?: string;
  fecha_entrega: string;
  estado: EstadoTP;
  calificacion?: number;
  estudiante_id?: string;
}

export interface CrearLaboratorioInput {
  materia_id: string;
  titulo: string;
  fecha: string;
  observaciones?: string;
  tareasIniciales: string[];
  estudiante_id?: string;
}

export type ActualizarMateriaInput = Partial<CrearMateriaInput>;
export type ActualizarTrabajoPracticoInput = Partial<CrearTrabajoPracticoInput>;
export type ActualizarLaboratorioInput = Partial<CrearLaboratorioInput>;
