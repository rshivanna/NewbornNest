# AWS Deployment Guide

## Overview

This application is designed to work with AWS S3 for production deployments, keeping data storage separate from application code.

## Data Storage Architecture

### Local Development
- **Location**: `data/` folder at project root (outside application code)
- **Configuration**: Set in `backend/.env` with `DATA_PATH=../data`
- **Excluded from Git**: The `data/` folder is ignored in version control

### Production (AWS)
- **Location**: AWS S3 bucket
- **Configuration**: Enable S3 storage in environment variables
- **Benefits**: Scalable, durable, and separate from application code

## AWS S3 Configuration

### 1. Create an S3 Bucket

```bash
# Using AWS CLI
aws s3 mb s3://your-newborn-app-data --region us-east-1

# Set bucket policy for private access
aws s3api put-bucket-versioning \
  --bucket your-newborn-app-data \
  --versioning-configuration Status=Enabled
```

### 2. Create IAM User and Policy

Create an IAM user with the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-newborn-app-data/*",
        "arn:aws:s3:::your-newborn-app-data"
      ]
    }
  ]
}
```

### 3. Configure Environment Variables

Update your production environment variables:

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-newborn-app-data

# Enable S3 Storage
USE_S3_STORAGE=true

# Data path (not used when S3 is enabled)
DATA_PATH=../data
```

## S3 Bucket Structure

When using S3, patient data will be organized as follows:

```
s3://your-newborn-app-data/
├── index.json
├── sam_adams_667ba160/
│   ├── patient.json
│   └── images/
│       ├── sam_adams_face_abc123.jpg
│       ├── sam_adams_ear_def456.jpg
│       ├── sam_adams_foot_ghi789.jpg
│       └── sam_adams_palm_jkl012.jpg
└── jane_doe_a1b2c3d4/
    ├── patient.json
    └── images/
        └── ...
```

## Implementation Notes

### Current Status
- ✅ Local file storage implemented and working
- ✅ S3 support for image uploads implemented
- ⚠️ Patient JSON data still uses local filesystem
- 🔄 Full S3 integration for patient data (future enhancement)

### Future Enhancement: Full S3 Support

To fully migrate patient data to S3, the `patientService.js` would need updates to:

1. Use S3 SDK instead of `fs/promises` when `USE_S3_STORAGE=true`
2. Read/write `index.json` from S3
3. Read/write patient JSON files from S3
4. Handle S3 folder structure for patient organization

**Code structure would be:**
```javascript
class PatientService {
  constructor() {
    this.useS3 = process.env.USE_S3_STORAGE === 'true';

    if (this.useS3) {
      // Initialize S3 client
      this.s3Client = new S3Client({ region: process.env.AWS_REGION });
      this.bucket = process.env.AWS_S3_BUCKET;
    } else {
      // Use local filesystem
      this.dataDir = path.resolve(process.cwd(), process.env.DATA_PATH);
    }
  }

  async readIndex() {
    if (this.useS3) {
      // Read from S3
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: 'index.json'
      });
      const response = await this.s3Client.send(command);
      const data = await response.Body.transformToString();
      return JSON.parse(data);
    } else {
      // Read from local filesystem
      const data = await fs.readFile(this.indexFile, 'utf-8');
      return JSON.parse(data);
    }
  }

  // Similar pattern for other methods...
}
```

## Deployment Checklist

- [ ] Create S3 bucket
- [ ] Configure IAM user and policy
- [ ] Set environment variables in production
- [ ] Test file uploads to S3
- [ ] Verify CORS settings for frontend access
- [ ] Enable versioning on S3 bucket
- [ ] Set up lifecycle policies for data retention
- [ ] Configure backup/disaster recovery

## Security Considerations

1. **Never commit AWS credentials** - Use environment variables or AWS IAM roles
2. **Enable S3 bucket versioning** - Protect against accidental deletion
3. **Use S3 bucket policies** - Restrict access to application only
4. **Enable encryption at rest** - Use S3 server-side encryption
5. **Monitor access logs** - Enable S3 access logging
6. **Use HTTPS only** - Ensure secure data transmission

## Cost Optimization

1. **Use S3 Intelligent-Tiering** - Automatically move objects between access tiers
2. **Set lifecycle policies** - Archive old patient records to Glacier
3. **Monitor storage usage** - Use AWS Cost Explorer
4. **Compress images** - Reduce storage costs for photos

## Testing S3 Integration

### Test Image Upload
```bash
curl -X POST http://localhost:3000/api/patients/{id}/upload-image \
  -F "file=@test-image.jpg" \
  -F "imageType=face"
```

### Verify S3 Upload
```bash
aws s3 ls s3://your-newborn-app-data/ --recursive
```

## Troubleshooting

### Issue: "Access Denied" errors
- Verify IAM policy permissions
- Check bucket policy
- Confirm AWS credentials are correct

### Issue: CORS errors in browser
- Update S3 CORS configuration:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://your-frontend-domain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### Issue: Large upload failures
- Increase MAX_FILE_SIZE in environment
- Consider using S3 multipart upload for files > 5MB

## Migrating Existing Data to S3

If you have existing patient data in local storage:

```bash
# Install AWS CLI
# Configure credentials: aws configure

# Sync local data to S3
aws s3 sync ./data/ s3://your-newborn-app-data/ \
  --exclude "*.log" \
  --exclude "*.tmp"

# Verify sync
aws s3 ls s3://your-newborn-app-data/ --recursive

# Update environment to use S3
export USE_S3_STORAGE=true

# Restart application
```

## Support

For issues or questions:
- Check AWS S3 documentation: https://docs.aws.amazon.com/s3/
- Review application logs for detailed error messages
- Contact development team

---

**Note**: This guide reflects the current architecture. Full S3 integration for patient data is planned for future releases.
