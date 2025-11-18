import apiClient from './client';

export interface UploadedFile {
  fileName: string;
  url: string;
  storage: 'local' | 's3';
  size: number;
  mimeType: string;
  filePath?: string;
}

export const filesApi = {
  upload: async (file: File): Promise<UploadedFile> => {
    return apiClient.uploadFile('/files/upload', file);
  },

  uploadPatientImage: async (patientId: string, file: File, imageType?: string): Promise<UploadedFile> => {
    const endpoint = imageType
      ? `/patients/${patientId}/upload-image?imageType=${encodeURIComponent(imageType)}`
      : `/patients/${patientId}/upload-image`;
    return apiClient.uploadFile(endpoint, file);
  },

  uploadMultiple: async (files: File[]): Promise<UploadedFile[]> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/files/upload-multiple`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.data;
  },

  delete: async (fileName: string): Promise<void> => {
    return apiClient.delete(`/files/${fileName}`);
  },
};

export default filesApi;
