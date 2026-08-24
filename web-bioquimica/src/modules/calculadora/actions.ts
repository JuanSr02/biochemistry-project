"use server";

import { SolucionSolidaInput, SolucionSolidaResultado, DilucionInput, DilucionResultado } from "./types";

export async function calcularSolucionSolida(
  input: SolucionSolidaInput
): Promise<{ success: boolean; data?: SolucionSolidaResultado; error?: string }> {
  try {
    const { volumenMl, concentracionMolar, pesoMolecular, purezaPorcentaje = 100 } = input;

    if (volumenMl <= 0 || concentracionMolar <= 0 || pesoMolecular <= 0 || purezaPorcentaje <= 0 || purezaPorcentaje > 100) {
      return {
        success: false,
        error: "Los valores ingresados deben ser números mayores a 0 (y pureza entre 0 y 100%).",
      };
    }

    const volumenLitros = volumenMl / 1000;
    const masaPuraGramos = concentracionMolar * volumenLitros * pesoMolecular;
    const factorPureza = purezaPorcentaje / 100;
    const masaRealGramos = masaPuraGramos / factorPureza;

    const masaPuraRedondeada = Number(masaPuraGramos.toFixed(4));
    const masaRealRedondeada = Number(masaRealGramos.toFixed(4));
    const volInicialDisolucion = Math.round(volumenMl * 0.6);

    const instrucciones = [
      `Pesar exactamente ${masaRealRedondeada} g del reactivo sólido (pureza ${purezaPorcentaje}%) en una balanza analítica.`,
      `Disolver el sólido en aproximadamente ${volInicialDisolucion} mL de agua destilada o solvente en un vaso de precipitados.`,
      `Trasvasar cuantitativamente el contenido a un matraz aforado de ${volumenMl} mL lavando el vaso 2 a 3 veces.`,
      `Completar con agua destilada hasta la marca de aforo (${volumenMl} mL) y tapar.`,
      `Homogeneizar invirtiendo el matraz varias veces antes de usar.`
    ];

    return {
      success: true,
      data: {
        masaPuraGramos: masaPuraRedondeada,
        masaRealGramos: masaRealRedondeada,
        volumenMl,
        concentracionMolar,
        pesoMolecular,
        purezaPorcentaje,
        instrucciones,
      },
    };
  } catch {
    return {
      success: false,
      error: "Ocurrió un error inesperado al procesar la solución sólida.",
    };
  }
}

export async function calcularDilucion(
  input: DilucionInput
): Promise<{ success: boolean; data?: DilucionResultado; error?: string }> {
  try {
    const { concentracionInicial, concentracionFinal, volumenFinalMl } = input;

    if (concentracionInicial <= 0 || concentracionFinal <= 0 || volumenFinalMl <= 0) {
      return {
        success: false,
        error: "Los valores deben ser números mayores a 0.",
      };
    }

    if (concentracionFinal >= concentracionInicial) {
      return {
        success: false,
        error: "La concentración final deseada (C2) debe ser menor a la concentración inicial (C1).",
      };
    }

    const volumenAlicuotaMl = (concentracionFinal * volumenFinalMl) / concentracionInicial;
    const volumenSolventeMl = volumenFinalMl - volumenAlicuotaMl;

    const alicuotaRedondeada = Number(volumenAlicuotaMl.toFixed(3));
    const solventeRedondeado = Number(volumenSolventeMl.toFixed(3));

    const instrucciones = [
      `Tomar con pipeta de precisión exactamente ${alicuotaRedondeada} mL de la solución madre (${concentracionInicial} M / conc).`,
      `Transferir los ${alicuotaRedondeada} mL a un matraz aforado limpio de ${volumenFinalMl} mL.`,
      `Añadir aproximadamente ${solventeRedondeado} mL de solvente (agua destilada / buffer) para enrasar hasta la marca de aforo de ${volumenFinalMl} mL.`,
      `Mezclar e invertir suavemente el matraz para obtener una solución homogénea de concentración ${concentracionFinal}.`
    ];

    return {
      success: true,
      data: {
        volumenAlicuotaMl: alicuotaRedondeada,
        volumenSolventeMl: solventeRedondeado,
        concentracionInicial,
        concentracionFinal,
        volumenFinalMl,
        instrucciones,
      },
    };
  } catch {
    return {
      success: false,
      error: "Ocurrió un error inesperado al procesar la dilución.",
    };
  }
}
