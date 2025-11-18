import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

class PatientService {
  constructor() {
    // Use DATA_PATH from environment variable, default to '../data' (outside app)
    const dataPath = process.env.DATA_PATH || '../data';
    this.dataDir = path.resolve(process.cwd(), dataPath);
    this.indexFile = path.join(this.dataDir, 'index.json');
    this.useS3 = process.env.USE_S3_STORAGE === 'true';
    this.initialize();
  }

  async initialize() {
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
    }

    try {
      await fs.access(this.indexFile);
    } catch {
      await fs.writeFile(this.indexFile, JSON.stringify([], null, 2));
    }
  }

  // Sanitize patient name for folder creation
  sanitizeFolderName(name) {
    return name
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .toLowerCase()
      .substring(0, 50); // Limit length
  }

  // Create unique folder name
  async createPatientFolder(babyName) {
    const baseFolder = this.sanitizeFolderName(babyName || 'patient');
    const uniqueId = uuidv4().split('-')[0]; // Use first part of UUID
    const folderName = `${baseFolder}_${uniqueId}`;
    const folderPath = path.join(this.dataDir, folderName);

    await fs.mkdir(folderPath, { recursive: true });
    return { folderName, folderPath };
  }

  // Read index (list of all patients)
  async readIndex() {
    const data = await fs.readFile(this.indexFile, 'utf-8');
    return JSON.parse(data);
  }

  // Write index
  async writeIndex(index) {
    await fs.writeFile(this.indexFile, JSON.stringify(index, null, 2));
  }

  // Read patient from their folder
  async readPatientFromFolder(folderName) {
    const patientFile = path.join(this.dataDir, folderName, 'patient.json');
    const data = await fs.readFile(patientFile, 'utf-8');
    return JSON.parse(data);
  }

  // Write patient to their folder
  async writePatientToFolder(folderName, patientData) {
    const patientFile = path.join(this.dataDir, folderName, 'patient.json');
    await fs.writeFile(patientFile, JSON.stringify(patientData, null, 2));
  }

  async getAllPatients() {
    const index = await this.readIndex();
    const patients = [];

    for (const entry of index) {
      try {
        const patient = await this.readPatientFromFolder(entry.folderName);
        patients.push(patient);
      } catch (error) {
        console.error(`Failed to read patient from ${entry.folderName}:`, error);
      }
    }

    return patients;
  }

  async getPatientById(id) {
    const index = await this.readIndex();
    const entry = index.find(p => p.id === id);

    if (!entry) {
      throw new Error('Patient not found');
    }

    return await this.readPatientFromFolder(entry.folderName);
  }

  async createPatient(patientData) {
    const id = uuidv4();
    const { folderName, folderPath } = await this.createPatientFolder(patientData.babyName);

    const newPatient = {
      id,
      babyName: patientData.babyName || '',
      motherName: patientData.motherName || '',
      address: patientData.address || '',
      babyDetails: {
        gestationalAge: patientData.babyDetails?.gestationalAge || '',
        weightKg: patientData.babyDetails?.weightKg || 0,
        sex: patientData.babyDetails?.sex || '',
        heartRateBpm: patientData.babyDetails?.heartRateBpm || 0,
        temperatureC: patientData.babyDetails?.temperatureC || 0,
      },
      maternalDetails: {
        maternalAgeYears: patientData.maternalDetails?.maternalAgeYears || 0,
        parity: patientData.maternalDetails?.parity || '',
        location: patientData.maternalDetails?.location || '',
        maternalEducation: patientData.maternalDetails?.maternalEducation || '',
        deliveryMode: patientData.maternalDetails?.deliveryMode || '',
        gestationalHistory: patientData.maternalDetails?.gestationalHistory || '',
        gestationalAgeEstimationMethod: patientData.maternalDetails?.gestationalAgeEstimationMethod || '',
      },
      images: patientData.images || {},
      folderName,
      folderPath,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save patient data to their folder
    await this.writePatientToFolder(folderName, newPatient);

    // Update index
    const index = await this.readIndex();
    index.push({
      id,
      babyName: newPatient.babyName,
      motherName: newPatient.motherName,
      folderName,
      createdAt: newPatient.createdAt,
    });
    await this.writeIndex(index);

    return newPatient;
  }

  async updatePatient(id, patientData) {
    const index = await this.readIndex();
    const entry = index.find(p => p.id === id);

    if (!entry) {
      throw new Error('Patient not found');
    }

    // Read existing patient
    const existingPatient = await this.readPatientFromFolder(entry.folderName);

    // Merge updates
    const updatedPatient = {
      ...existingPatient,
      babyName: patientData.babyName ?? existingPatient.babyName,
      motherName: patientData.motherName ?? existingPatient.motherName,
      address: patientData.address ?? existingPatient.address,
      babyDetails: {
        ...existingPatient.babyDetails,
        ...patientData.babyDetails,
      },
      maternalDetails: {
        ...existingPatient.maternalDetails,
        ...patientData.maternalDetails,
      },
      images: {
        ...existingPatient.images,
        ...patientData.images,
      },
      updatedAt: new Date().toISOString(),
    };

    // Save updated patient
    await this.writePatientToFolder(entry.folderName, updatedPatient);

    // Update index if name changed
    const indexEntry = index.find(p => p.id === id);
    if (indexEntry) {
      indexEntry.babyName = updatedPatient.babyName;
      indexEntry.motherName = updatedPatient.motherName;
      await this.writeIndex(index);
    }

    return updatedPatient;
  }

  async deletePatient(id) {
    const index = await this.readIndex();
    const entryIndex = index.findIndex(p => p.id === id);

    if (entryIndex === -1) {
      throw new Error('Patient not found');
    }

    const entry = index[entryIndex];
    const patient = await this.readPatientFromFolder(entry.folderName);

    // Delete patient folder
    const folderPath = path.join(this.dataDir, entry.folderName);
    await fs.rm(folderPath, { recursive: true, force: true });

    // Remove from index
    index.splice(entryIndex, 1);
    await this.writeIndex(index);

    return patient;
  }

  async searchPatients(query) {
    const patients = await this.getAllPatients();

    if (!query) {
      return patients;
    }

    const searchTerm = query.toLowerCase();
    return patients.filter(patient => {
      return (
        patient.babyName?.toLowerCase().includes(searchTerm) ||
        patient.motherName?.toLowerCase().includes(searchTerm) ||
        patient.address?.toLowerCase().includes(searchTerm) ||
        patient.babyDetails?.sex?.toLowerCase().includes(searchTerm) ||
        patient.maternalDetails?.location?.toLowerCase().includes(searchTerm)
      );
    });
  }
}

export default new PatientService();
