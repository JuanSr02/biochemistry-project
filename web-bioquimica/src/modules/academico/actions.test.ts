import { describe, it, expect } from "vitest";
import {
  getMaterias,
  crearMateria,
  getTrabajosPracticos,
  crearTrabajoPractico,
  cambiarEstadoTP,
  getLaboratorios,
  crearLaboratorio,
  toggleTareaLaboratorio,
} from "./actions";

describe("BioTrack Module — Academic & Laboratory Server Actions Tests", () => {
  describe("Materias", () => {
    it("debe obtener el listado de materias", async () => {
      const res = await getMaterias();
      expect(res.success).toBe(true);
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data.length).toBeGreaterThan(0);
    });

    it("debe crear una nueva materia con sus datos y campos de auditoría", async () => {
      const res = await crearMateria({
        nombre: "Fisiología Humana",
        codigo: "FIS-401",
        profesor: "Dra. Ana López",
        cuatrimestre: "2º Cuatrimestre 2026",
        estado: "cursando",
      });

      expect(res.success).toBe(true);
      expect(res.data).toBeDefined();
      if (res.data) {
        expect(res.data.nombre).toBe("Fisiología Humana");
        expect(res.data.codigo).toBe("FIS-401");
        expect(res.data.created_at).toBeDefined();
        expect(res.data.created_by).toBeDefined();
        expect(res.data.updated_at).toBeDefined();
        expect(res.data.updated_by).toBeDefined();
      }
    });

    it("debe rechazar materias sin nombre o código", async () => {
      const res = await crearMateria({
        nombre: "",
        codigo: "   ",
        cuatrimestre: "1º Cuatrimestre",
        estado: "cursando",
      });

      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });
  });

  describe("Trabajos Prácticos", () => {
    it("debe obtener el listado de trabajos prácticos", async () => {
      const res = await getTrabajosPracticos();
      expect(res.success).toBe(true);
      expect(res.data.length).toBeGreaterThan(0);
    });

    it("debe actualizar el estado de un trabajo práctico", async () => {
      const tpsRes = await getTrabajosPracticos();
      const tpTarget = tpsRes.data[0];

      const res = await cambiarEstadoTP(tpTarget.id, "entregado");
      expect(res.success).toBe(true);

      const tpsUpdated = await getTrabajosPracticos();
      const updated = tpsUpdated.data.find((t) => t.id === tpTarget.id);
      expect(updated?.estado).toBe("entregado");
    });
  });

  describe("Laboratorios y Checklist de Tareas", () => {
    it("debe crear una sesión de laboratorio con sus tareas asociadas", async () => {
      const res = await crearLaboratorio({
        materia_id: "mat-1",
        titulo: "Sesión 5: Electroforesis en Gel de Poliacrilamida (PAGE)",
        fecha: "2026-09-15",
        observaciones: "Usar guantes de nitrilo.",
        tareasIniciales: [
          "Preparación del gel de corrido al 12%",
          "Carga de marcadores de peso molecular",
          "Aplicación de voltaje constante a 100V",
        ],
      });

      expect(res.success).toBe(true);
      expect(res.data).toBeDefined();
      if (res.data) {
        expect(res.data.titulo).toContain("Electroforesis");
        expect(res.data.tareas.length).toBe(3);
        expect(res.data.estado).toBe("pendiente");
      }
    });

    it("debe alternar (toggle) el estado de una tarea y actualizar el estado general del laboratorio", async () => {
      const labsRes = await getLaboratorios();
      const labTarget = labsRes.data[0];
      const tareaTarget = labTarget.tareas[0];

      const estadoInicial = tareaTarget.completada;

      const toggleRes = await toggleTareaLaboratorio(labTarget.id, tareaTarget.id);
      expect(toggleRes.success).toBe(true);

      const labsUpdated = await getLaboratorios();
      const labUpdated = labsUpdated.data.find((l) => l.id === labTarget.id);
      const tareaUpdated = labUpdated?.tareas.find((t) => t.id === tareaTarget.id);

      expect(tareaUpdated?.completada).toBe(!estadoInicial);
    });
  });
});
