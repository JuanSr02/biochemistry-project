// Query Keys centralizadas
export const queryKeys = {
  // Auth
  auth: {
    user: ['auth', 'user'] as const,
    session: ['auth', 'session'] as const,
  },
  // Académico
  academico: {
    all: ['academico'] as const,
    materias: () => [...queryKeys.academico.all, 'materias'] as const,
    materia: (id: string) => [...queryKeys.academico.materias(), id] as const,
  },
  // Calculadora
  calculadora: {
    all: ['calculadora'] as const,
    historial: () => [...queryKeys.calculadora.all, 'historial'] as const,
  },
  // Flashcards
  flashcards: {
    all: ['flashcards'] as const,
    mazos: () => [...queryKeys.flashcards.all, 'mazos'] as const,
    mazo: (id: string) => [...queryKeys.flashcards.mazos(), id] as const,
  }
};
