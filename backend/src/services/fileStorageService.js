import fs from 'fs/promises';
import path from 'path';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

class FileStorageService {
  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.useS3 = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

    if (this.useS3) {
      this.s3Client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });
      this.bucket = process.env.AWS_S3_BUCKET;
      console.log('📦 Using AWS S3 for file storage');
    } else {
      console.log('📁 Using local file storage');
      this.ensureUploadDirectory();
    }
  }

  async ensureUploadDirectory() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  generateFileName(originalName, patientName = null, imageType = null) {
    const ext = path.extname(originalName);
    const uniqueId = uuidv4().split('-')[0]; // Use first part of UUID

    if (patientName && imageType) {
      // Sanitize patient name (same as folder naming)
      const sanitizedName = patientName
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '_')
        .toLowerCase()
        .substring(0, 30);

      // Sanitize image type
      const sanitizedType = imageType
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase();

      return `${sanitizedName}_${sanitizedType}_${uniqueId}${ext}`;
    } else {
      // Fallback to old naming
      const name = path.basename(originalName, ext);
      return `${name}-${uniqueId}${ext}`;
    }
  }

  async uploadFile(file, targetFolder = null, patientName = null, imageType = null) {
    const fileName = this.generateFileName(file.originalname, patientName, imageType);

    if (this.useS3) {
      return await this.uploadToS3(file, fileName);
    } else {
      return await this.uploadLocally(file, fileName, targetFolder);
    }
  }

  async uploadLocally(file, fileName, targetFolder = null) {
    // If targetFolder is provided, save to that folder, otherwise use default uploads
    const uploadPath = targetFolder
      ? path.join(targetFolder, 'images')
      : this.uploadDir;

    // Ensure the directory exists
    await fs.mkdir(uploadPath, { recursive: true });

    const filePath = path.join(uploadPath, fileName);
    await fs.writeFile(filePath, file.buffer);

    // Generate URL based on whether it's in a patient folder or uploads
    const url = targetFolder
      ? `/api/patients/images/${path.basename(targetFolder)}/${fileName}`
      : `/api/files/${fileName}`;

    return {
      fileName,
      filePath,
      url,
      storage: 'local',
      size: file.size,
      mimeType: file.mimetype
    };
  }

  async uploadToS3(file, fileName) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype
    });

    await this.s3Client.send(command);
    const url = await this.getS3SignedUrl(fileName);

    return {
      fileName,
      url,
      storage: 's3',
      size: file.size,
      mimeType: file.mimetype
    };
  }

  async getFile(fileName) {
    if (this.useS3) {
      return await this.getS3SignedUrl(fileName);
    } else {
      const filePath = path.join(this.uploadDir, fileName);
      await fs.access(filePath); // Check if file exists
      return filePath;
    }
  }

  async getS3SignedUrl(fileName, expiresIn = 3600) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: fileName
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async deleteFile(fileName) {
    if (this.useS3) {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: fileName
      });
      await this.s3Client.send(command);
    } else {
      const filePath = path.join(this.uploadDir, fileName);
      await fs.unlink(filePath);
    }
  }

  async listFiles(prefix = '') {
    if (this.useS3) {
      // Implement S3 listing if needed
      throw new Error('S3 listing not implemented');
    } else {
      const files = await fs.readdir(this.uploadDir);
      return files.filter(f => f.startsWith(prefix));
    }
  }
}

export default new FileStorageService();
