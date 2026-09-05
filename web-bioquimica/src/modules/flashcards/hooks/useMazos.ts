import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/query-keys';

const fetchMazos = async () => {
  return [
    { id: '1', titulo: 'Aminoácidos Esenciales', cantidad: 20 },
    { id: '2', titulo: 'Ciclo de Krebs', cantidad: 15 }
  ];
};

export const useMazos = () => {
  return useQuery({
    queryKey: queryKeys.flashcards.mazos(),
    queryFn: fetchMazos,
  });
};
