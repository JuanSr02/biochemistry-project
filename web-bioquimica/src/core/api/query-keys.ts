// Llaves de caché centralizadas y tipadas para React Query
// Todas las queries del proyecto deben referenciar estas llaves

export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    user: () => ['auth', 'user'] as const,
    session: () => ['auth', 'session'] as const,
  },

  // Académico
  academico: {
    all: ['academico'] as const,
    materias: (userId?: string) =>
      ['academico', 'materias', userId ?? 'all'] as const,
    tps: (userId?: string) =>
      ['academico', 'tps', userId ?? 'all'] as const,
    laboratorios: (userId?: string) =>
      ['academico', 'laboratorios', userId ?? 'all'] as const,
  },

  // Flashcards
  flashcards: {
    all: ['flashcards'] as const,
    tarjetas: (userId?: string) =>
      ['flashcards', 'tarjetas', userId ?? 'all'] as const,
  },

  // Calculadora (historial de cálculos — solo client-side via Zustand,
  // pero si en el futuro se persiste en BD, estas llaves estarán listas)
  calculadora: {
    all: ['calculadora'] as const,
    historial: (userId?: string) =>
      ['calculadora', 'historial', userId ?? 'all'] as const,
  },
};
