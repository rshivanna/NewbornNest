import fileStorageService from '../services/fileStorageService.js';
import fs from 'fs/promises';

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
    }

    const result = await fileStorageService.uploadFile(req.file);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const uploadMultipleFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: { message: 'No files uploaded' } });
    }

    const results = await Promise.all(
      req.files.map(file => fileStorageService.uploadFile(file))
    );

    res.status(201).json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

export const getFile = async (req, res, next) => {
  try {
    const { fileName } = req.params;
    const filePath = await fileStorageService.getFile(fileName);

    if (fileStorageService.useS3) {
      // For S3, return the signed URL
      res.json({ success: true, data: { url: filePath } });
    } else {
      // For local storage, send the file
      res.sendFile(filePath);
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ success: false, error: { message: 'File not found' } });
    }
    next(error);
  }
};

export const deleteFile = async (req, res, next) => {
  try {
    const { fileName } = req.params;
    await fileStorageService.deleteFile(fileName);
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ success: false, error: { message: 'File not found' } });
    }
    next(error);
  }
};
