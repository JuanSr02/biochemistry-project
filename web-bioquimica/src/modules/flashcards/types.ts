export type EstadoRepaso = "nuevo" | "repasando" | "dominado";
export type NivelDificultad = "facil" | "media" | "dificil";

export interface TarjetaEstudio {
  id: string;
  materia_id?: string;
  materia_nombre: string;
  categoria: string;
  pregunta: string;
  respuesta: string;
  nivel_dificultad: NivelDificultad;
  estado_repaso: EstadoRepaso;
  repasos_correctos: number;
  proximo_repaso?: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export type Flashcard = TarjetaEstudio;

export interface CrearFlashcardInput {
  materia_id?: string;
  categoria: string;
  pregunta: string;
  respuesta: string;
  nivel_dificultad: NivelDificultad;
}

export interface ActualizarFlashcardInput {
  materia_id?: string;
  categoria?: string;
  pregunta?: string;
  respuesta?: string;
  nivel_dificultad?: NivelDificultad;
}
