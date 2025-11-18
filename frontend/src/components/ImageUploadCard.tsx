import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Camera, Trash2, Upload } from "lucide-react";
import { CameraCapture } from "./CameraCapture";
import { useFileUpload } from "@/hooks/api/useFileUpload";
import { filesApi } from "@/api/files";
import { toast } from "sonner";

interface ImageUploadCardProps {
  title: string;
  imageUrl?: string;
  onUpload: (imageUrl: string) => void;
  onRemove: () => void;
  patientId?: string;
}

export const ImageUploadCard = ({
  title,
  imageUrl,
  onUpload,
  onRemove,
  patientId,
}: ImageUploadCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const uploadFile = useFileUpload();

  // Extract image type from title (e.g., "Face Photo" -> "face")
  const getImageType = () => {
    return title.toLowerCase().replace(' photo', '').trim();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Image size should be less than 50MB");
      return;
    }

    setIsLoading(true);

    try {
      // Upload file to backend (patient folder if patientId provided, otherwise uploads folder)
      const result = patientId
        ? await filesApi.uploadPatientImage(patientId, file, getImageType())
        : await uploadFile.mutateAsync(file);

      // Use the URL from the server
      const imageUrl = result.url.startsWith('http')
        ? result.url
        : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${result.url}`;
      onUpload(imageUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraCapture = async (imageData: string) => {
    setIsLoading(true);
    try {
      // Convert base64 to File object
      const response = await fetch(imageData);
      const blob = await response.blob();
      const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });

      // Upload to backend (patient folder if patientId provided, otherwise uploads folder)
      const result = patientId
        ? await filesApi.uploadPatientImage(patientId, file, getImageType())
        : await uploadFile.mutateAsync(file);

      const imageUrl = result.url.startsWith('http')
        ? result.url
        : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${result.url}`;
      onUpload(imageUrl);
      toast.success("Photo captured and uploaded successfully");
      setShowCamera(false);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload photo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = () => {
    onRemove();
    setShowDeleteConfirm(false);
    toast.success("Photo removed successfully");
  };

  return (
    <>
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
          title={title}
        />
      )}
      
      <Card className="overflow-hidden bg-card">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" />
            {title}
          </h3>

        <div>
          {imageUrl ? (
            <div className="relative mb-3">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="aspect-square rounded-lg border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center p-4 mb-3">
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground text-center">
                No image uploaded
              </p>
            </div>
          )}

          {/* Action buttons - always shown */}
          <div className="w-full space-y-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowCamera(true)}
              disabled={isLoading}
              className="w-full"
            >
              <Camera className="w-4 h-4 mr-2" />
              {imageUrl ? "Retake Photo" : "Take Photo"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleButtonClick}
              disabled={isLoading}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isLoading ? "Uploading..." : imageUrl ? "Replace Photo" : "Upload Photo"}
            </Button>
            {imageUrl && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Photo
              </Button>
            )}
          </div>
        </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Photo?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this {title.toLowerCase()}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
