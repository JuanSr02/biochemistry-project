import { QueryClient } from '@tanstack/react-query';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // En SSR, usualmente se quiere establecer un staleTime mayor a 0
        // para evitar re-fetches inmediatos en el cliente tras la hidratación.
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Servidor: siempre crear un nuevo query client por request
    return makeQueryClient();
  } else {
    // Cliente: Singleton, crear una vez y reusar
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
