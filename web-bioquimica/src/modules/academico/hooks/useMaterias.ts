import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/query-keys';

const fetchMaterias = async () => {
  return [
    { id: '1', nombre: 'Biología Celular', creditos: 4 },
    { id: '2', nombre: 'Química Orgánica', creditos: 5 }
  ];
};

export const useMaterias = () => {
  return useQuery({
    queryKey: queryKeys.academico.materias(),
    queryFn: fetchMaterias,
  });
};
