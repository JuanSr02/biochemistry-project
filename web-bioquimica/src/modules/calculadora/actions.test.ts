import { describe, it, expect } from "vitest";
import { calcularSolucionSolida, calcularDilucion } from "./actions";

describe("ChemCalc Module — Server Actions Tests", () => {
  describe("calcularSolucionSolida", () => {
    it("debe calcular correctamente la masa pura y real para reactivo 100% puro", async () => {
      // 500 mL, 0.1 M, NaOH (PM = 40 g/mol), 100% pureza
      const res = await calcularSolucionSolida({
        volumenMl: 500,
        concentracionMolar: 0.1,
        pesoMolecular: 40,
        purezaPorcentaje: 100,
      });

      expect(res.success).toBe(true);
      expect(res.data).toBeDefined();
      if (res.data) {
        expect(res.data.masaPuraGramos).toBe(2); // 0.1 * 0.5 * 40 = 2g
        expect(res.data.masaRealGramos).toBe(2);
        expect(res.data.instrucciones.length).toBeGreaterThan(0);
      }
    });

    it("debe ajustar correctamente la masa real cuando la pureza es menor al 100%", async () => {
      // 1000 mL (1L), 1 M, NaCl (PM = 58.44 g/mol), 90% pureza
      const res = await calcularSolucionSolida({
        volumenMl: 1000,
        concentracionMolar: 1,
        pesoMolecular: 58.44,
        purezaPorcentaje: 90,
      });

      expect(res.success).toBe(true);
      if (res.data) {
        expect(res.data.masaPuraGramos).toBe(58.44);
        // 58.44 / 0.9 = 64.9333... -> 64.9333
        expect(res.data.masaRealGramos).toBe(64.9333);
      }
    });

    it("debe rechazar valores negativos o cero", async () => {
      const res = await calcularSolucionSolida({
        volumenMl: -500,
        concentracionMolar: 0.1,
        pesoMolecular: 40,
        purezaPorcentaje: 100,
      });

      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });

    it("debe rechazar porcentajes de pureza mayores a 100%", async () => {
      const res = await calcularSolucionSolida({
        volumenMl: 500,
        concentracionMolar: 0.1,
        pesoMolecular: 40,
        purezaPorcentaje: 120,
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("pureza");
    });
  });

  describe("calcularDilucion (C1V1 = C2V2)", () => {
    it("debe calcular los volúmenes exactos de alícuota y solvente para dilución válida", async () => {
      // C1 = 10 M, C2 = 1 M, V2 = 100 mL
      const res = await calcularDilucion({
        concentracionInicial: 10,
        concentracionFinal: 1,
        volumenFinalMl: 100,
      });

      expect(res.success).toBe(true);
      if (res.data) {
        expect(res.data.volumenAlicuotaMl).toBe(10); // (1 * 100) / 10 = 10 mL
        expect(res.data.volumenSolventeMl).toBe(90); // 100 - 10 = 90 mL
        expect(res.data.instrucciones.length).toBe(4);
      }
    });

    it("debe rechazar si la concentración deseada (C2) es mayor o igual a la madre (C1)", async () => {
      const res = await calcularDilucion({
        concentracionInicial: 2,
        concentracionFinal: 5, // C2 > C1 inválido
        volumenFinalMl: 100,
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("menor");
    });

    it("debe rechazar volúmenes o concentraciones <= 0", async () => {
      const res = await calcularDilucion({
        concentracionInicial: 0,
        concentracionFinal: 1,
        volumenFinalMl: 100,
      });

      expect(res.success).toBe(false);
    });
  });
});
