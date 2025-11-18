import express from 'express';
import upload from '../middleware/upload.js';
import {
  uploadFile,
  uploadMultipleFiles,
  getFile,
  deleteFile
} from '../controllers/fileController.js';

const router = express.Router();

// Routes
router.post('/upload', upload.single('file'), uploadFile);
router.post('/upload-multiple', upload.array('files', 10), uploadMultipleFiles);
router.get('/:fileName', getFile);
router.delete('/:fileName', deleteFile);

export default router;
