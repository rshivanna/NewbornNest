import { useMutation } from '@tanstack/react-query';
import { filesApi } from '@/api/files';
import { useToast } from '@/hooks/use-toast';

export const useFileUpload = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (file: File) => filesApi.upload(file),
    onError: (error: Error) => {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload file',
        variant: 'destructive',
      });
    },
  });
};

export const useMultipleFileUpload = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (files: File[]) => filesApi.uploadMultiple(files),
    onError: (error: Error) => {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload files',
        variant: 'destructive',
      });
    },
  });
};
