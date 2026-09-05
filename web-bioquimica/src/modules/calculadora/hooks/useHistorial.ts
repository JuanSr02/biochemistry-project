import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/query-keys';

const fetchHistorial = async () => {
  return [
    { id: '1', formula: 'Concentración = masa / volumen', resultado: '2.5 M' }
  ];
};

export const useHistorial = () => {
  return useQuery({
    queryKey: queryKeys.calculadora.historial(),
    queryFn: fetchHistorial,
  });
};
