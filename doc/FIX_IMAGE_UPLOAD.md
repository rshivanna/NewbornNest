# Image Upload Fix - PayloadTooLargeError

## Problem
When capturing images with the camera, you were getting:
```
PayloadTooLargeError: request entity too large
```

## Root Cause
The issue had two parts:

1. **Backend**: Express server had a default body size limit of ~100kb, which was too small for base64-encoded images
2. **Frontend**: Images were being converted to base64 strings and stored directly in the patient data, making the request payload enormous (base64 images can be 5-50MB+)

## Solution Applied

### 1. Backend Changes (`backend/src/server.js`)

Increased the request body size limit to 50MB:

```javascript
// Before
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// After
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
```

### 2. Backend Configuration (`backend/.env`)

Updated file size limit:
```env
MAX_FILE_SIZE=52428800  # 50MB in bytes
```

### 3. Frontend Changes (`frontend/src/components/ImageUploadCard.tsx`)

Changed the image upload flow to:

**Before:**
- Camera captures image → Convert to base64 → Store base64 in patient data → Send entire payload to backend
- Problem: Payload could be 50MB+ per patient with images

**After:**
- Camera captures image → Convert to File object → Upload file to backend → Get URL → Store only URL in patient data
- Result: Payload is now just a small JSON object with URLs

Key changes:
```typescript
// Now using the file upload API
const uploadFile = useFileUpload();

// Upload file first
const result = await uploadFile.mutateAsync(file);

// Store only the URL
onUpload(imageUrl);
```

## How It Works Now

1. **User captures/selects image** → Image is converted to a File object
2. **Frontend uploads file** → POST request to `/api/files/upload`
3. **Backend saves file** → Stored in `backend/uploads/` (or AWS S3 if configured)
4. **Backend returns URL** → e.g., `/api/files/image-123.jpg`
5. **Frontend stores URL** → Only the URL is saved in patient data
6. **Future requests** → Patient data is small (just URLs, not base64)

## Benefits

✅ **Smaller payloads**: Patient data is now tiny (just URLs)
✅ **Faster saves**: No need to send massive base64 strings
✅ **Better performance**: Images are loaded separately, not blocking patient data
✅ **Scalable**: Can handle any number of images without payload issues
✅ **Production-ready**: Files are properly stored and can be served efficiently

## File Size Limits

- **Frontend validation**: 50MB per image
- **Backend limit**: 50MB request body size
- **Multer limit**: 50MB file upload (configured in `backend/.env`)

## Testing

To verify the fix:

1. **Start backend**: `cd backend && npm run dev`
2. **Start frontend**: `cd frontend && npm run dev`
3. **Capture an image** with the camera
4. **Verify**:
   - Image uploads successfully
   - No "PayloadTooLargeError"
   - Check `backend/uploads/` folder for the saved file
   - Patient data contains URL like `/api/files/camera-1234567890.jpg`

## AWS S3 (Optional)

If you configure AWS S3 in `backend/.env`:
- Files will be uploaded to S3 instead of local storage
- URLs will be S3 signed URLs
- No change needed in frontend code

## Next Steps

If you still encounter issues:

1. **Check file size**: Very large images (>50MB) will still fail
2. **Increase limits**: Edit the `50mb` values in server.js and .env
3. **Compress images**: Consider adding image compression before upload
4. **Use S3**: For production, configure AWS S3 for better scalability

The error should now be resolved! 🎉
