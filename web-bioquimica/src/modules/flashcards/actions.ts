"use server";

import { createClient } from "@/core/lib/supabase/server";
import { isSupabaseConfigured } from "@/core/lib/supabase/utils";
import { TarjetaEstudio, CrearFlashcardInput, ActualizarFlashcardInput } from "./types";
import { getMaterias } from "@/modules/academico/actions";

let MOCK_FLASHCARDS: TarjetaEstudio[] = [
  {
    id: "fc-1",
    materia_id: "mat-1",
    materia_nombre: "Química Biológica I",
    categoria: "Vías Metabólicas",
    pregunta: "¿Cuál es la enzima reguladora clave y marcapasos de la Glucólisis?",
    respuesta: "La Fosfofructocinasa-1 (PFK-1), inhibida alostéricamente por ATP y citrato, y activada por AMP y Fructosa-2,6-bisfosfato.",
    nivel_dificultad: "media",
    estado_repaso: "repasando",
    repasos_correctos: 2,
    sm2_intervalo: 0,
    sm2_facilidad: 2.5,
    sm2_repeticiones: 0,
    proximo_repaso: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
    created_by: "00000000-0000-0000-0000-000000000001",
    updated_at: new Date().toISOString(),
    updated_by: "00000000-0000-0000-0000-000000000001",
  },
  {
    id: "fc-2",
    materia_id: "mat-2",
    materia_nombre: "Enzimología Aplicada",
    categoria: "Cinética Enzimática",
    pregunta: "¿Qué representa la constante de Michaelis-Menten (Km)?",
    respuesta: "Es la concentración de sustrato [S] a la cual la velocidad de reacción es exactamente la mitad de la velocidad máxima (Vmax/2). Indica la afinidad de la enzima por el sustrato (menor Km = mayor afinidad).",
    nivel_dificultad: "facil",
    estado_repaso: "dominado",
    repasos_correctos: 5,
    sm2_intervalo: 0,
    sm2_facilidad: 2.5,
    sm2_repeticiones: 0,
    proximo_repaso: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    created_at: new Date().toISOString(),
    created_by: "00000000-0000-0000-0000-000000000001",
    updated_at: new Date().toISOString(),
    updated_by: "00000000-0000-0000-0000-000000000001",
  },
  {
    id: "fc-3",
    materia_id: "mat-1",
    materia_nombre: "Química Biológica I",
    categoria: "Cadena Respiratoria",
    pregunta: "¿Cuál es la función del Complejo IV (Citocromo c Oxidasa) en la fosforilación oxidativa?",
    respuesta: "Transfiere electrones del citocromo c reducido al oxígeno molecular (O2), reduciéndolo a H2O y bombeando 2 protones H+ al espacio intermembrana por par de electrones.",
    nivel_dificultad: "dificil",
    estado_repaso: "nuevo",
    repasos_correctos: 0,
    sm2_intervalo: 0,
    sm2_facilidad: 2.5,
    sm2_repeticiones: 0,
    proximo_repaso: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
    created_by: "00000000-0000-0000-0000-000000000001",
    updated_at: new Date().toISOString(),
    updated_by: "00000000-0000-0000-0000-000000000001",
  },
  {
    id: "fc-4",
    materia_id: "mat-3",
    materia_nombre: "Biología Molecular",
    categoria: "Replicación de ADN",
    pregunta: "¿Qué enzima remueve los cebadores (primers) de ARN en procariotas?",
    respuesta: "La ADN Polimerasa I, gracias a su actividad exonucleasa 5' → 3', rellenando simultáneamente el hueco con desoxirribonucleótidos.",
    nivel_dificultad: "media",
    estado_repaso: "repasando",
    repasos_correctos: 1,
    sm2_intervalo: 0,
    sm2_facilidad: 2.5,
    sm2_repeticiones: 0,
    proximo_repaso: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
    created_by: "00000000-0000-0000-0000-000000000001",
    updated_at: new Date().toISOString(),
    updated_by: "00000000-0000-0000-0000-000000000001",
  },
];

export async function getTarjetasEstudio(estudianteId?: string): Promise<{ success: boolean; data: TarjetaEstudio[] }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      let query = supabase.from("tarjetas_estudio").select("*, materias(nombre)");
      if (estudianteId) {
        query = query.eq("estudiante_id", estudianteId);
      }
      const { data, error } = await query.order("created_at", { ascending: false });

      if (!error && data) {
        const formatted = data.map((item: any) => ({
          ...item,
          materia_nombre: item.materias?.nombre || "Bioquímica General",
        }));
        return { success: true, data: formatted as TarjetaEstudio[] };
      }
    } catch {
    }
  }

  let result = [...MOCK_FLASHCARDS];
  if (estudianteId) {
    result = result.filter(f => f.estudiante_id === estudianteId);
  }

  return {
    success: true,
    data: result,
  };
}

export async function registrarRespuestaFlashcard(
  id: string,
  calidad: number
): Promise<{ success: boolean; data?: TarjetaEstudio; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data: actual } = await supabase
        .from("tarjetas_estudio")
        .select("repasos_correctos, sm2_intervalo, sm2_facilidad, sm2_repeticiones")
        .eq("id", id)
        .single();

      let facilidad = actual?.sm2_facilidad ?? 2.5;
      let repeticiones = actual?.sm2_repeticiones ?? 0;
      let intervalo = actual?.sm2_intervalo ?? 0;

      if (calidad >= 3) {
        if (repeticiones === 0) intervalo = 1;
        else if (repeticiones === 1) intervalo = 6;
        else intervalo = Math.round(intervalo * facilidad);
        repeticiones += 1;
      } else {
        repeticiones = 0;
        intervalo = 1;
      }

      facilidad = facilidad + (0.1 - (5 - calidad) * (0.08 + (5 - calidad) * 0.02));
      if (facilidad < 1.3) facilidad = 1.3;

      const repasosPrevios = actual?.repasos_correctos || 0;
      const nuevosRepasos = calidad >= 3 ? repasosPrevios + 1 : 0;
      const nuevoEstado = calidad >= 3 ? (repeticiones >= 3 ? "dominado" : "repasando") : "repasando";
      
      const proximo_repaso = new Date();
      proximo_repaso.setDate(proximo_repaso.getDate() + intervalo);

      const { data: updated, error } = await supabase
        .from("tarjetas_estudio")
        .update({
          repasos_correctos: nuevosRepasos,
          estado_repaso: nuevoEstado,
          sm2_intervalo: intervalo,
          sm2_facilidad: facilidad,
          sm2_repeticiones: repeticiones,
          proximo_repaso: proximo_repaso.toISOString().split("T")[0],
        })
        .eq("id", id)
        .select("*, materias(nombre)")
        .single();

      if (!error && updated) {
        return {
          success: true,
          data: {
            ...updated,
            materia_nombre: (updated as any).materias?.nombre || "Bioquímica General",
          },
        };
      }
    } catch {
    }
  }

  const card = MOCK_FLASHCARDS.find((c) => c.id === id);
  if (!card) return { success: false, error: "Tarjeta no encontrada." };

  if (calidad >= 3) {
    if (card.sm2_repeticiones === 0) card.sm2_intervalo = 1;
    else if (card.sm2_repeticiones === 1) card.sm2_intervalo = 6;
    else card.sm2_intervalo = Math.round((card.sm2_intervalo || 1) * (card.sm2_facilidad || 2.5));
    card.sm2_repeticiones = (card.sm2_repeticiones || 0) + 1;
  } else {
    card.sm2_repeticiones = 0;
    card.sm2_intervalo = 1;
  }

  let facilidad = card.sm2_facilidad || 2.5;
  facilidad = facilidad + (0.1 - (5 - calidad) * (0.08 + (5 - calidad) * 0.02));
  if (facilidad < 1.3) facilidad = 1.3;
  card.sm2_facilidad = facilidad;

  if (calidad >= 3) {
    card.repasos_correctos += 1;
    card.estado_repaso = card.sm2_repeticiones >= 3 ? "dominado" : "repasando";
  } else {
    card.repasos_correctos = 0;
    card.estado_repaso = "repasando";
  }
  
  const pRepaso = new Date();
  pRepaso.setDate(pRepaso.getDate() + card.sm2_intervalo);
  card.proximo_repaso = pRepaso.toISOString().split("T")[0];

  card.updated_at = new Date().toISOString();

  return { success: true, data: card };
}

export async function crearFlashcard(
  input: CrearFlashcardInput
): Promise<{ success: boolean; data?: TarjetaEstudio; error?: string }> {
  if (!input.pregunta.trim() || !input.respuesta.trim() || !input.categoria.trim()) {
    return { success: false, error: "Pregunta, respuesta y categoría son obligatorios." };
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("tarjetas_estudio")
        .insert({
          materia_id: input.materia_id || null,
          categoria: input.categoria.trim(),
          pregunta: input.pregunta.trim(),
          respuesta: input.respuesta.trim(),
          nivel_dificultad: input.nivel_dificultad,
          estado_repaso: "nuevo",
          repasos_correctos: 0,
          sm2_intervalo: 0,
          sm2_facilidad: 2.5,
          sm2_repeticiones: 0,
          estudiante_id: input.estudiante_id,
        })
        .select("*, materias(nombre)")
        .single();

      if (!error && data) {
        return {
          success: true,
          data: {
            ...data,
            materia_nombre: (data as any).materias?.nombre || "Bioquímica General",
          },
        };
      }
    } catch {
    }
  }

  let materiaNombre = "Bioquímica General";
  if (input.materia_id) {
      const { data: materias } = await getMaterias();
      const m = materias?.find(m => m.id === input.materia_id);
      if (m) materiaNombre = m.nombre;
  }

  const nuevaCard: TarjetaEstudio = {
    id: `fc-${Date.now()}`,
    materia_id: input.materia_id,
    materia_nombre: materiaNombre,
    categoria: input.categoria.trim(),
    pregunta: input.pregunta.trim(),
    respuesta: input.respuesta.trim(),
    nivel_dificultad: input.nivel_dificultad,
    estado_repaso: "nuevo",
    repasos_correctos: 0,
    sm2_intervalo: 0,
    sm2_facilidad: 2.5,
    sm2_repeticiones: 0,
    estudiante_id: input.estudiante_id,
    created_at: new Date().toISOString(),
    created_by: input.estudiante_id || "00000000-0000-0000-0000-000000000001",
    updated_at: new Date().toISOString(),
    updated_by: input.estudiante_id || "00000000-0000-0000-0000-000000000001",
  };

  MOCK_FLASHCARDS.unshift(nuevaCard);
  return { success: true, data: nuevaCard };
}

export async function actualizarFlashcard(
  id: string,
  input: ActualizarFlashcardInput
): Promise<{ success: boolean; data?: TarjetaEstudio; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const payload: any = {};
      if (input.materia_id !== undefined) payload.materia_id = input.materia_id || null;
      if (input.categoria !== undefined) payload.categoria = input.categoria.trim();
      if (input.pregunta !== undefined) payload.pregunta = input.pregunta.trim();
      if (input.respuesta !== undefined) payload.respuesta = input.respuesta.trim();
      if (input.nivel_dificultad !== undefined) payload.nivel_dificultad = input.nivel_dificultad;

      const { data, error } = await supabase
        .from("tarjetas_estudio")
        .update(payload)
        .eq("id", id)
        .select("*, materias(nombre)")
        .single();

      if (!error && data) {
        return {
          success: true,
          data: {
            ...data,
            materia_nombre: (data as any).materias?.nombre || "Bioquímica General",
          },
        };
      }
    } catch {
    }
  }

  const card = MOCK_FLASHCARDS.find((c) => c.id === id);
  if (!card) return { success: false, error: "Tarjeta no encontrada." };

  if (input.materia_id !== undefined) card.materia_id = input.materia_id;
  if (input.categoria !== undefined) card.categoria = input.categoria.trim();
  if (input.pregunta !== undefined) card.pregunta = input.pregunta.trim();
  if (input.respuesta !== undefined) card.respuesta = input.respuesta.trim();
  if (input.nivel_dificultad !== undefined) card.nivel_dificultad = input.nivel_dificultad;
  
  if (input.materia_id) {
    const { data: materias } = await getMaterias();
    const m = materias?.find(m => m.id === input.materia_id);
    if (m) card.materia_nombre = m.nombre;
  }

  card.updated_at = new Date().toISOString();

  return { success: true, data: card };
}

export async function eliminarFlashcard(id: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("tarjetas_estudio")
        .delete()
        .eq("id", id);
      if (!error) return { success: true };
    } catch {
    }
  }

  const index = MOCK_FLASHCARDS.findIndex((c) => c.id === id);
  if (index === -1) return { success: false, error: "Tarjeta no encontrada." };
  
  MOCK_FLASHCARDS.splice(index, 1);
  return { success: true };
}
