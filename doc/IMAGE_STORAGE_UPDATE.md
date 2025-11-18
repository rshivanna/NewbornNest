# Image Storage in Patient Folders

## ✅ Update Complete

Images are now saved directly in each patient's folder instead of a global uploads directory.

## 📁 New Folder Structure

```
backend/data/
├── index.json
├── baby_john_a1b2c3d4/
│   ├── patient.json
│   └── images/                      ← Patient's images here
│       ├── face-550e8400.jpg
│       ├── ear-e29b41d4.jpg
│       ├── foot-a716446.jpg
│       └── palm-55440000.jpg
└── baby_emma_e5f6g7h8/
    ├── patient.json
    └── images/
        ├── face-123abc.jpg
        └── ear-456def.jpg
```

## 🔄 How It Works

### 1. Image Upload Flow

```
User captures/selects image
    ↓
Frontend: POST /api/patients/{id}/upload-image
    ↓
Backend: Get patient folder path
    ↓
Backend: Save to data/{folder_name}/images/{filename}.jpg
    ↓
Backend: Return URL: /api/patients/images/{folder_name}/{filename}.jpg
    ↓
Frontend: Store URL in patient.images
    ↓
Frontend: Update patient data
```

### 2. Image Retrieval Flow

```
Frontend requests: /api/patients/images/baby_john_a1b2c3d4/face-123.jpg
    ↓
Backend: Locate file at data/baby_john_a1b2c3d4/images/face-123.jpg
    ↓
Backend: Send file to frontend
```

## 🆕 New API Endpoints

### Upload Patient Image
```http
POST /api/patients/:id/upload-image
Content-Type: multipart/form-data

Body: file (image file)

Response:
{
  "success": true,
  "data": {
    "fileName": "face-550e8400.jpg",
    "filePath": "/path/to/data/baby_john_a1b2c3d4/images/face-550e8400.jpg",
    "url": "/api/patients/images/baby_john_a1b2c3d4/face-550e8400.jpg",
    "storage": "local",
    "size": 245678,
    "mimeType": "image/jpeg"
  }
}
```

### Get Patient Image
```http
GET /api/patients/images/:folderName/:fileName

Response: Image file (binary)
```

## 📄 Example Patient Data

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "babyName": "Baby John",
  "motherName": "Jane Doe",
  "images": {
    "face": "/api/patients/images/baby_john_a1b2c3d4/face-550e8400.jpg",
    "ear": "/api/patients/images/baby_john_a1b2c3d4/ear-e29b41d4.jpg",
    "foot": "/api/patients/images/baby_john_a1b2c3d4/foot-a716446.jpg",
    "palm": "/api/patients/images/baby_john_a1b2c3d4/palm-55440000.jpg"
  },
  "folderName": "baby_john_a1b2c3d4",
  ...
}
```

## 🔧 Files Modified

### Backend:
1. **`backend/src/services/fileStorageService.js`**
   - Added `targetFolder` parameter to `uploadFile()`
   - Images saved to `{folder}/images/` directory
   - URL format updated for patient images

2. **`backend/src/controllers/patientController.js`**
   - Added `uploadPatientImage()` - Upload to patient folder
   - Added `getPatientImage()` - Serve patient images

3. **`backend/src/routes/patientRoutes.js`**
   - Added `POST /:id/upload-image` route
   - Added `GET /images/:folderName/:fileName` route

### Frontend:
4. **`frontend/src/api/files.ts`**
   - Added `uploadPatientImage(patientId, file)` method

5. **`frontend/src/components/ImageUploadCard.tsx`**
   - Added `patientId` prop
   - Uses patient-specific upload when patientId provided

6. **`frontend/src/pages/PatientDetail.tsx`**
   - Passes `patientId` to ImageUploadCard components

## ✨ Benefits

✅ **Organized**: All patient data (JSON + images) in one folder
✅ **Easy Backup**: Copy patient folder to backup everything
✅ **Easy Migration**: Move patient folder between systems
✅ **Clear Ownership**: Images clearly belong to specific patient
✅ **Clean Deletion**: Deleting patient removes all their data
✅ **No Orphaned Files**: Images can't be orphaned from patient data

## 🧪 Testing

### Create Patient and Upload Image:

```bash
# 1. Create patient
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "babyName": "Baby John",
    "motherName": "Jane Doe",
    "address": "123 Main St",
    "babyDetails": {...},
    "maternalDetails": {...}
  }'

# Response will include patient ID: "550e8400-e29b-41d4-a716-446655440000"

# 2. Upload image for this patient
curl -X POST http://localhost:3000/api/patients/550e8400-e29b-41d4-a716-446655440000/upload-image \
  -F "file=@/path/to/image.jpg"

# 3. Check the folder structure
ls backend/data/baby_john_*/images/
```

### Verify Image Storage:

```bash
# Check patient folder
ls -R backend/data/baby_john_*

# Output:
# backend/data/baby_john_a1b2c3d4:
# patient.json  images/
#
# backend/data/baby_john_a1b2c3d4/images:
# face-550e8400.jpg  ear-e29b41d4.jpg
```

## 🔄 Old vs New

### Old (❌ Deprecated):
```
backend/uploads/
├── face-123.jpg         ← All images mixed together
├── ear-456.jpg
├── foot-789.jpg
└── random-012.jpg       ← Whose image is this?
```

### New (✅ Current):
```
backend/data/
├── baby_john_a1b2c3d4/
│   ├── patient.json
│   └── images/
│       ├── face-123.jpg  ← John's images
│       └── ear-456.jpg
└── baby_emma_e5f6g7h8/
    ├── patient.json
    └── images/
        └── foot-789.jpg  ← Emma's images
```

## 📝 Image URL Format

### Patient Images (New):
```
/api/patients/images/{folder_name}/{filename}.jpg
Example: /api/patients/images/baby_john_a1b2c3d4/face-550e8400.jpg
```

### Global Uploads (Old - still works):
```
/api/files/{filename}.jpg
Example: /api/files/image-123.jpg
```

## 🚀 Usage in Frontend

The ImageUploadCard component automatically uses patient-specific upload when `patientId` is provided:

```tsx
<ImageUploadCard
  title="Face Photo"
  imageUrl={patient.images?.face}
  onUpload={(url) => handleImageUpload("face", url)}
  onRemove={() => handleRemoveImage("face")}
  patientId={patient.id}  ← Images saved to patient's folder
/>
```

## 🗑️ Deletion Behavior

When you delete a patient:
```javascript
DELETE /api/patients/{id}
```

The entire patient folder is removed, including:
- ✅ patient.json
- ✅ All images in images/ folder
- ✅ Any other files in the folder

No orphaned files left behind!

## 🌟 Future Enhancements

You can now easily add more file types to patient folders:

```
baby_john_a1b2c3d4/
├── patient.json
├── images/
│   ├── face.jpg
│   └── ear.jpg
├── reports/              ← Add medical reports
│   └── assessment.pdf
├── lab_results/          ← Add lab results
│   └── blood_test.pdf
└── notes.txt            ← Add notes
```

---

**All patient data is now perfectly organized in individual folders! 🎉**
