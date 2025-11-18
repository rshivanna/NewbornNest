import { useState } from "react";
import { Plus, Baby } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatientCard } from "@/components/PatientCard";
import { PatientDialog } from "@/components/PatientDialog";
import { SearchBar } from "@/components/SearchBar";
import { usePatients, useSearchPatients, useCreatePatient, useUpdatePatient } from "@/hooks/api/usePatients";
import { Patient } from "@/api/patients";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const { data: allPatients = [], isLoading, isError } = usePatients();
  const { data: searchResults } = useSearchPatients(searchQuery);
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();

  const displayedPatients = searchQuery.trim() ? searchResults || [] : allPatients;

  const handleSavePatient = async (
    patientData: Omit<Patient, "id" | "createdAt" | "updatedAt" | "folderName" | "folderPath"> & { id?: string }
  ) => {
    if (patientData.id) {
      // Update existing patient
      await updatePatient.mutateAsync({ id: patientData.id, data: patientData });
    } else {
      // Add new patient
      await createPatient.mutateAsync(patientData);
    }
    setEditingPatient(null);
    setDialogOpen(false);
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingPatient(null);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Baby className="w-16 h-16 mx-auto text-primary mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading patients...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Baby className="w-16 h-16 mx-auto text-destructive mb-4" />
          <h3 className="text-lg font-medium mb-2">Failed to load patients</h3>
          <p className="text-muted-foreground text-sm mb-4">Please make sure the backend server is running</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-accent text-white sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-1">
            <Baby className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Newborn gestation age estimation data collection tool</h1>
          </div>
          <p className="text-white/90 text-sm">Patient Management System</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Search and Add Section */}
        <div className="mb-6 space-y-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <Button
            onClick={handleAddNew}
            className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-medium shadow-md"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Patient
          </Button>
        </div>

        {/* Patient List */}
        <div className="space-y-4">
          {displayedPatients.length === 0 ? (
            <div className="text-center py-12">
              <Baby className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-card-foreground mb-2">
                {searchQuery ? "No patients found" : "No patients yet"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Add your first patient to get started"}
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-card-foreground">
                  Patients ({displayedPatients.length})
                </h2>
              </div>
              {displayedPatients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  onEdit={handleEdit}
                />
              ))}
            </>
          )}
        </div>
      </main>

      {/* Patient Dialog */}
      <PatientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        patient={editingPatient}
        onSave={handleSavePatient}
      />
    </div>
  );
};

export default Index;
