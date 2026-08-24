import { describe, it, expect } from "vitest";
import { getTarjetasEstudio, registrarRespuestaFlashcard } from "./actions";

describe("BioFlash Module — Flashcards Server Actions Tests", () => {
  it("debe obtener las tarjetas de estudio disponibles", async () => {
    const res = await getTarjetasEstudio();
    expect(res.success).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
  });

  it("debe incrementar repasos correctos y actualizar estado cuando el usuario sabe la respuesta", async () => {
    const flashcardsRes = await getTarjetasEstudio();
    const cardTarget = flashcardsRes.data[0];
    const aciertosPrevios = cardTarget.repasos_correctos;

    const res = await registrarRespuestaFlashcard(cardTarget.id, true);
    expect(res.success).toBe(true);
    expect(res.data?.repasos_correctos).toBe(aciertosPrevios + 1);
  });

  it("debe reiniciar la racha de aciertos cuando el usuario no sabe la respuesta", async () => {
    const flashcardsRes = await getTarjetasEstudio();
    const cardTarget = flashcardsRes.data[1]; // Tiene repasos previas

    const res = await registrarRespuestaFlashcard(cardTarget.id, false);
    expect(res.success).toBe(true);
    expect(res.data?.repasos_correctos).toBe(0);
    expect(res.data?.estado_repaso).toBe("repasando");
  });
});
