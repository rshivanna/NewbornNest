import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsApi, Patient } from '@/api/patients';
import { useToast } from '@/hooks/use-toast';

const QUERY_KEYS = {
  patients: ['patients'],
  patient: (id: string) => ['patients', id],
  search: (query: string) => ['patients', 'search', query],
};

export const usePatients = () => {
  return useQuery({
    queryKey: QUERY_KEYS.patients,
    queryFn: patientsApi.getAll,
  });
};

export const usePatient = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.patient(id),
    queryFn: () => patientsApi.getById(id),
    enabled: !!id,
  });
};

export const useSearchPatients = (query: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.search(query),
    queryFn: () => patientsApi.search(query),
    enabled: query.length > 0,
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (patient: Partial<Patient>) => patientsApi.create(patient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patients });
      toast({
        title: 'Success',
        description: 'Patient created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create patient',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Patient> }) =>
      patientsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patients });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patient(variables.id) });
      toast({
        title: 'Success',
        description: 'Patient updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update patient',
        variant: 'destructive',
      });
    },
  });
};

export const useDeletePatient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => patientsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patients });
      toast({
        title: 'Success',
        description: 'Patient deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete patient',
        variant: 'destructive',
      });
    },
  });
};
