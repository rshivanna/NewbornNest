import apiClient from './client';

export interface Patient {
  id: string;
  babyName: string;
  motherName: string;
  address: string;
  babyDetails: {
    gestationalAge: string;
    weightKg: number;
    sex: string;
    heartRateBpm: number;
    temperatureC: number;
  };
  maternalDetails: {
    maternalAgeYears: number;
    parity: string;
    location: string;
    maternalEducation: string;
    deliveryMode: string;
    gestationalHistory: string;
    gestationalAgeEstimationMethod: string;
  };
  images?: {
    face?: string;
    ear?: string;
    foot?: string;
    palm?: string;
  };
  folderName?: string;
  folderPath?: string;
  createdAt: string;
  updatedAt: string;
}

export const patientsApi = {
  getAll: async (): Promise<Patient[]> => {
    return apiClient.get<Patient[]>('/patients');
  },

  getById: async (id: string): Promise<Patient> => {
    return apiClient.get<Patient>(`/patients/${id}`);
  },

  search: async (query: string): Promise<Patient[]> => {
    return apiClient.get<Patient[]>(`/patients/search?q=${encodeURIComponent(query)}`);
  },

  create: async (patient: Partial<Patient>): Promise<Patient> => {
    return apiClient.post<Patient>('/patients', patient);
  },

  update: async (id: string, patient: Partial<Patient>): Promise<Patient> => {
    return apiClient.put<Patient>(`/patients/${id}`, patient);
  },

  delete: async (id: string): Promise<Patient> => {
    return apiClient.delete<Patient>(`/patients/${id}`);
  },

  deleteImage: async (id: string, imageType: 'face' | 'ear' | 'foot' | 'palm'): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<{ success: boolean; message: string }>(`/patients/${id}/image/${imageType}`);
  },
};

export default patientsApi;
