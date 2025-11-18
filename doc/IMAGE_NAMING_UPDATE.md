# Image Naming Convention Update

## ✅ Updated Image Filenames

Images are now named with patient name + photo type + unique ID for better organization.

## 📝 New Naming Format

```
{patient_name}_{photo_type}_{unique_id}.{extension}
```

### Examples:

| Patient Name | Photo Type | Generated Filename |
|--------------|------------|-------------------|
| Sam Adams | Face | `sam_adams_face_a1b2c3d4.jpg` |
| Sam Adams | Ear | `sam_adams_ear_e5f6g7h8.jpg` |
| Baby John | Foot | `baby_john_foot_i9j0k1l2.jpg` |
| Emma Rose Smith | Palm | `emma_rose_smith_palm_m3n4o5p6.jpg` |
| José García | Face | `jos_garca_face_q7r8s9t0.jpg` |

## 🔄 Old vs New

### Old Naming (❌):
```
camera-1763239250714-e3ccbe0c-2746-4e71-b04b-c9e0807eecf9.jpg
```
- ❌ Can't tell whose image it is
- ❌ Can't tell what body part
- ❌ Very long filename

### New Naming (✅):
```
sam_adams_face_667ba160.jpg
```
- ✅ Patient name visible
- ✅ Photo type visible (face, ear, foot, palm)
- ✅ Unique ID to prevent conflicts
- ✅ Clean, readable filename

## 📁 Complete Folder Structure

```
backend/data/
└── sam_adams_667ba160/
    ├── patient.json
    └── images/
        ├── sam_adams_face_a1b2c3d4.jpg
        ├── sam_adams_ear_e5f6g7h8.jpg
        ├── sam_adams_foot_i9j0k1l2.jpg
        └── sam_adams_palm_m3n4o5p6.jpg
```

## 🔧 How It Works

### 1. Filename Generation

```javascript
// Backend: fileStorageService.js
generateFileName(originalName, patientName, imageType) {
  // Sanitize patient name
  const sanitizedName = patientName
    .replace(/[^a-zA-Z0-9\s-]/g, '')  // Remove special chars
    .replace(/\s+/g, '_')              // Spaces → underscores
    .toLowerCase()
    .substring(0, 30);                 // Limit to 30 chars

  // Sanitize image type
  const sanitizedType = imageType
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();

  // Get unique ID (first 8 chars of UUID)
  const uniqueId = uuidv4().split('-')[0];

  // Combine: patient_type_id.ext
  return `${sanitizedName}_${sanitizedType}_${uniqueId}.jpg`;
}
```

### 2. Upload Flow

```
Frontend (PatientDetail page)
    ↓
ImageUploadCard receives:
  - title: "Face Photo"
  - patientId: "550e8400-..."
    ↓
Extract imageType from title:
  "Face Photo" → "face"
    ↓
POST /api/patients/{id}/upload-image?imageType=face
    ↓
Backend gets patient:
  - babyName: "Sam Adams"
  - folderName: "sam_adams_667ba160"
    ↓
Generate filename:
  sam_adams_face_a1b2c3d4.jpg
    ↓
Save to:
  data/sam_adams_667ba160/images/sam_adams_face_a1b2c3d4.jpg
```

## 📋 Sanitization Rules

### Patient Name:
- Remove special characters (keep letters, numbers, spaces, hyphens)
- Convert spaces to underscores
- Convert to lowercase
- Limit to 30 characters

| Original | Sanitized |
|----------|-----------|
| Sam Adams | sam_adams |
| Baby John | baby_john |
| Emma-Rose | emmarose |
| José García | jos_garca |
| Baby #123 | baby_123 |

### Image Type:
- Remove all special characters
- Convert to lowercase

| Title | Image Type |
|-------|------------|
| Face Photo | face |
| Ear Photo | ear |
| Foot Photo | foot |
| Palm Photo | palm |

### Unique ID:
- First 8 characters of UUID
- Ensures no filename conflicts
- Examples: `a1b2c3d4`, `e5f6g7h8`

## 🔧 Files Modified

### Backend:
1. **`backend/src/services/fileStorageService.js`**
   - Updated `generateFileName()` - accepts patientName and imageType
   - Generates descriptive filenames

2. **`backend/src/controllers/patientController.js`**
   - Passes patient name and imageType to file storage service
   - Gets imageType from query parameter

### Frontend:
3. **`frontend/src/api/files.ts`**
   - Updated `uploadPatientImage()` - accepts imageType parameter
   - Adds imageType to query string

4. **`frontend/src/components/ImageUploadCard.tsx`**
   - Added `getImageType()` - extracts type from title prop
   - Passes imageType when uploading

## ✨ Benefits

✅ **Readable**: Filename tells you exactly what it is
✅ **Organized**: Easy to find specific images
✅ **Self-documenting**: No need to look up what the image is
✅ **Searchable**: Can search by patient name or image type
✅ **Unique**: UUID ensures no conflicts
✅ **Consistent**: All images follow same naming pattern

## 🧪 Testing

### Upload Face Photo for Sam Adams:

```bash
# 1. Create patient
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "babyName": "Sam Adams",
    "motherName": "Jane Adams",
    ...
  }'

# Returns: { "id": "550e8400-...", "folderName": "sam_adams_667ba160", ... }

# 2. Upload face photo
curl -X POST "http://localhost:3000/api/patients/550e8400-.../upload-image?imageType=face" \
  -F "file=@face.jpg"

# Returns:
# {
#   "fileName": "sam_adams_face_a1b2c3d4.jpg",
#   "url": "/api/patients/images/sam_adams_667ba160/sam_adams_face_a1b2c3d4.jpg"
# }

# 3. Check the file
ls backend/data/sam_adams_667ba160/images/
# Output: sam_adams_face_a1b2c3d4.jpg
```

## 📊 Naming Examples

### Complete Patient Folder:

```
backend/data/sam_adams_667ba160/
├── patient.json
└── images/
    ├── sam_adams_face_a1b2c3d4.jpg      ← Face photo
    ├── sam_adams_ear_e5f6g7h8.jpg       ← Ear photo
    ├── sam_adams_foot_i9j0k1l2.jpg      ← Foot photo
    └── sam_adams_palm_m3n4o5p6.jpg      ← Palm photo
```

### Multiple Patients:

```
backend/data/
├── sam_adams_667ba160/
│   └── images/
│       ├── sam_adams_face_a1b2c3d4.jpg
│       └── sam_adams_ear_e5f6g7h8.jpg
│
├── baby_john_8f3e2a1c/
│   └── images/
│       ├── baby_john_face_b2c3d4e5.jpg
│       └── baby_john_foot_f6g7h8i9.jpg
│
└── emma_rose_smith_4d2a9b7c/
    └── images/
        └── emma_rose_smith_palm_j0k1l2m3.jpg
```

## 🔍 Image URL Example

When you upload an image, you get this URL:
```
/api/patients/images/sam_adams_667ba160/sam_adams_face_a1b2c3d4.jpg
```

Breakdown:
- `/api/patients/images/` - Base path for patient images
- `sam_adams_667ba160/` - Patient folder
- `sam_adams_face_a1b2c3d4.jpg` - Descriptive filename

## 📦 In Patient JSON

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "babyName": "Sam Adams",
  "images": {
    "face": "/api/patients/images/sam_adams_667ba160/sam_adams_face_a1b2c3d4.jpg",
    "ear": "/api/patients/images/sam_adams_667ba160/sam_adams_ear_e5f6g7h8.jpg",
    "foot": "/api/patients/images/sam_adams_667ba160/sam_adams_foot_i9j0k1l2.jpg",
    "palm": "/api/patients/images/sam_adams_667ba160/sam_adams_palm_m3n4o5p6.jpg"
  }
}
```

---

**Image filenames are now clear, organized, and self-documenting! 🎉**
