import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Camera, User, MapPin, Calendar, Baby } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageUploadCard } from "@/components/ImageUploadCard";
import { usePatient, useUpdatePatient } from "@/hooks/api/usePatients";
import { patientsApi } from "@/api/patients";
import { toast } from "sonner";

export const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: patient, isLoading, isError } = usePatient(id!);
  const updatePatient = useUpdatePatient();

  const handleImageUpload = async (type: "face" | "ear" | "foot" | "palm", imageUrl: string) => {
    if (!patient) return;

    const updatedImages = {
      ...patient.images,
      [type]: imageUrl,
    };

    await updatePatient.mutateAsync({
      id: patient.id,
      data: { images: updatedImages },
    });
  };

  const handleRemoveImage = async (type: "face" | "ear" | "foot" | "palm") => {
    if (!patient) return;

    try {
      // Call API to delete the image file and update patient data
      await patientsApi.deleteImage(patient.id, type);

      // Invalidate and refetch patient data to get updated info
      await updatePatient.mutateAsync({
        id: patient.id,
        data: {},
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Baby className="w-16 h-16 mx-auto text-primary mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading patient details...</p>
        </div>
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Baby className="w-16 h-16 mx-auto text-destructive mb-4" />
          <h3 className="text-lg font-medium mb-2">Patient not found</h3>
          <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-accent text-white sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-white hover:bg-white/20 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <Camera className="w-7 h-7" />
            <div>
              <h1 className="text-xl font-bold">{patient.babyName}</h1>
              <p className="text-white/90 text-sm">Patient Details</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Patient Info Card */}
        <Card className="p-5 mb-6 bg-card">
          <h2 className="text-lg font-semibold text-card-foreground mb-3">
            Patient Information
          </h2>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Mother:</span>
              <span className="text-card-foreground font-medium">{patient.motherName}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Address:</span>
              <span className="text-card-foreground">{patient.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Added:</span>
              <span className="text-card-foreground">
                {new Date(patient.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }).replace(/\//g, '/')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Updated:</span>
              <span className="text-card-foreground">
                {new Date(patient.updatedAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }).replace(/\//g, '/')}
              </span>
            </div>
          </div>
        </Card>

        {/* Medical Photos Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">
            Medical Photos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ImageUploadCard
              title="Face Photo"
              imageUrl={patient.images?.face}
              onUpload={(url) => handleImageUpload("face", url)}
              onRemove={() => handleRemoveImage("face")}
              patientId={patient.id}
            />
            <ImageUploadCard
              title="Ear Photo"
              imageUrl={patient.images?.ear}
              onUpload={(url) => handleImageUpload("ear", url)}
              onRemove={() => handleRemoveImage("ear")}
              patientId={patient.id}
            />
            <ImageUploadCard
              title="Foot Photo"
              imageUrl={patient.images?.foot}
              onUpload={(url) => handleImageUpload("foot", url)}
              onRemove={() => handleRemoveImage("foot")}
              patientId={patient.id}
            />
            <ImageUploadCard
              title="Palm Photo"
              imageUrl={patient.images?.palm}
              onUpload={(url) => handleImageUpload("palm", url)}
              onRemove={() => handleRemoveImage("palm")}
              patientId={patient.id}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
