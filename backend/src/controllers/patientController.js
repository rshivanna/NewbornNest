import patientService from '../services/patientService.js';
import fileStorageService from '../services/fileStorageService.js';
import { validationResult } from 'express-validator';
import path from 'path';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

export const getAllPatients = async (req, res, next) => {
  try {
    const patients = await patientService.getAllPatients();
    res.json({ success: true, data: patients });
  } catch (error) {
    next(error);
  }
};

export const getPatientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patient = await patientService.getPatientById(id);
    res.json({ success: true, data: patient });
  } catch (error) {
    if (error.message === 'Patient not found') {
      return res.status(404).json({ success: false, error: { message: error.message } });
    }
    next(error);
  }
};

export const createPatient = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const patient = await patientService.createPatient(req.body);
    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

export const updatePatient = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const patient = await patientService.updatePatient(id, req.body);
    res.json({ success: true, data: patient });
  } catch (error) {
    if (error.message === 'Patient not found') {
      return res.status(404).json({ success: false, error: { message: error.message } });
    }
    next(error);
  }
};

export const deletePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patient = await patientService.deletePatient(id);
    res.json({ success: true, data: patient, message: 'Patient deleted successfully' });
  } catch (error) {
    if (error.message === 'Patient not found') {
      return res.status(404).json({ success: false, error: { message: error.message } });
    }
    next(error);
  }
};

export const searchPatients = async (req, res, next) => {
  try {
    const { q } = req.query;
    const patients = await patientService.searchPatients(q);
    res.json({ success: true, data: patients });
  } catch (error) {
    next(error);
  }
};

export const uploadPatientImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { imageType } = req.query; // Get image type from query parameter (face, ear, foot, palm)

    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
    }

    // Get patient to find their folder and name
    const patient = await patientService.getPatientById(id);
    const patientFolderPath = patient.folderPath;
    const patientName = patient.babyName || 'patient';

    // Upload file to patient's folder with custom naming
    const result = await fileStorageService.uploadFile(
      req.file,
      patientFolderPath,
      patientName,
      imageType || 'image'
    );

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    if (error.message === 'Patient not found') {
      return res.status(404).json({ success: false, error: { message: error.message } });
    }
    next(error);
  }
};

export const getPatientImage = async (req, res, next) => {
  try {
    const { folderName, fileName } = req.params;

    // Use DATA_PATH from environment variable
    const dataPath = process.env.DATA_PATH || '../data';
    const dataDir = path.resolve(process.cwd(), dataPath);

    // Construct path to image in patient's folder
    const imagePath = path.join(
      dataDir,
      folderName,
      'images',
      fileName
    );

    // Check if file exists
    await fs.access(imagePath);

    // Send the file
    res.sendFile(imagePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ success: false, error: { message: 'Image not found' } });
    }
    next(error);
  }
};

export const deletePatientImage = async (req, res, next) => {
  try {
    const { id, imageType } = req.params;

    // Get patient data
    const patient = await patientService.getPatientById(id);

    if (!patient.images || !patient.images[imageType]) {
      return res.status(404).json({ success: false, error: { message: 'Image not found' } });
    }

    // Extract filename from URL
    const imageUrl = patient.images[imageType];
    const fileName = imageUrl.split('/').pop();

    // Use DATA_PATH from environment variable
    const dataPath = process.env.DATA_PATH || '../data';
    const dataDir = path.resolve(process.cwd(), dataPath);

    // Construct path to image file
    const imagePath = path.join(
      dataDir,
      patient.folderName,
      'images',
      fileName
    );

    // Delete the physical file
    try {
      await fs.unlink(imagePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continue even if file doesn't exist
    }

    // Update patient data to remove image reference
    const updatedImages = {
      ...patient.images,
      [imageType]: undefined,
    };

    await patientService.updatePatient(id, { images: updatedImages });

    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    if (error.message === 'Patient not found') {
      return res.status(404).json({ success: false, error: { message: error.message } });
    }
    next(error);
  }
};
