import express from 'express';
import { body } from 'express-validator';
import upload from '../middleware/upload.js';
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  searchPatients,
  uploadPatientImage,
  getPatientImage,
  deletePatientImage
} from '../controllers/patientController.js';

const router = express.Router();

// Validation rules
const patientValidation = [
  body('babyName').optional().trim().notEmpty().withMessage('Baby name cannot be empty'),
  body('motherName').optional().trim().notEmpty().withMessage('Mother name cannot be empty'),
];

// Routes
router.get('/', getAllPatients);
router.get('/search', searchPatients);
router.get('/images/:folderName/:fileName', getPatientImage);
router.get('/:id', getPatientById);
router.post('/', patientValidation, createPatient);
router.post('/:id/upload-image', upload.single('file'), uploadPatientImage);
router.put('/:id', patientValidation, updatePatient);
router.delete('/:id/image/:imageType', deletePatientImage);
router.delete('/:id', deletePatient);

export default router;
