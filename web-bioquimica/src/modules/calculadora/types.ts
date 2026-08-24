export interface SolucionSolidaInput {
  volumenMl: number;
  concentracionMolar: number;
  pesoMolecular: number;
  purezaPorcentaje?: number;
}

export interface SolucionSolidaResultado {
  masaPuraGramos: number;
  masaRealGramos: number;
  volumenMl: number;
  concentracionMolar: number;
  pesoMolecular: number;
  purezaPorcentaje: number;
  instrucciones: string[];
}

export interface DilucionInput {
  concentracionInicial: number;
  concentracionFinal: number;
  volumenFinalMl: number;
}

export interface DilucionResultado {
  volumenAlicuotaMl: number;
  volumenSolventeMl: number;
  concentracionInicial: number;
  concentracionFinal: number;
  volumenFinalMl: number;
  instrucciones: string[];
}
