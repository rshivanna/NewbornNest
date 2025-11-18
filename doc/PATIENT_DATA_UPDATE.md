# Patient Data Storage Update

## ✅ Changes Implemented

The patient data storage system has been completely restructured to use individual folders per patient with the new data format you specified.

## 📁 New Folder Structure

```
backend/data/
├── index.json                          # Quick index of all patients
├── baby_john_a1b2c3d4/                # Each patient gets their own folder
│   └── patient.json                    # Patient data in standardized format
├── baby_emma_e5f6g7h8/
│   └── patient.json
└── baby_sarah_i9j0k1l2/
    └── patient.json
```

## 🔄 Old vs New

### Old Structure (❌ Deprecated):
```
backend/data/
└── patients.json                       # All patients in one file
```

### New Structure (✅ Current):
```
backend/data/
├── index.json                          # Patient index
└── {patient_folder}/                   # One folder per patient
    └── patient.json                    # Individual patient data
```

## 📋 New Data Format

Each `patient.json` file follows this structure:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "babyName": "Baby John",
  "motherName": "Jane Doe",
  "address": "123 Main St, Anytown, USA",
  "babyDetails": {
    "gestationalAge": "39 weeks",
    "weightKg": 3.4,
    "sex": "Male",
    "heartRateBpm": 140,
    "temperatureC": 36.8
  },
  "maternalDetails": {
    "maternalAgeYears": 30,
    "parity": "G1P1",
    "location": "Anytown General Hospital",
    "maternalEducation": "College",
    "deliveryMode": "Vaginal",
    "gestationalHistory": "No complications.",
    "gestationalAgeEstimationMethod": "Ultrasound"
  },
  "images": {
    "face": "/api/files/face-123.jpg",
    "ear": "/api/files/ear-456.jpg",
    "foot": "/api/files/foot-789.jpg",
    "palm": "/api/files/palm-012.jpg"
  },
  "folderName": "baby_john_a1b2c3d4",
  "folderPath": "/full/path/to/data/baby_john_a1b2c3d4",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

## 🗂️ Folder Naming

Folders are named using:
- **Sanitized baby name**: Lowercase, special chars removed, spaces → underscores
- **Unique ID**: First 8 chars of UUID
- **Format**: `{sanitized_name}_{unique_id}`

Examples:
- "Baby John" → `baby_john_a1b2c3d4`
- "Emma Rose" → `emma_rose_e5f6g7h8`
- "José García" → `jos_garca_i9j0k1l2`

## 📝 Files Updated

### Backend:
1. **`backend/src/services/patientService.js`** - Complete rewrite
   - Creates individual folders per patient
   - Saves data as `patient.json` in each folder
   - Maintains `index.json` for quick listing
   - Sanitizes names for folder creation

### Frontend:
2. **`frontend/src/api/patients.ts`** - Updated Patient interface
   - New fields: `babyDetails`, `maternalDetails`
   - Removed old fields: `name`, `fatherName`, `dateOfBirth`, etc.

### Documentation:
3. **`DATA_STRUCTURE.md`** - Complete documentation
4. **`PATIENT_DATA_UPDATE.md`** - This file
5. **`backend/data/example_patient_structure.md`** - Examples

## 🚀 How to Use

### 1. Start the servers:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Create a patient via API:
```bash
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "babyName": "Baby John",
    "motherName": "Jane Doe",
    "address": "123 Main St, Anytown, USA",
    "babyDetails": {
      "gestationalAge": "39 weeks",
      "weightKg": 3.4,
      "sex": "Male",
      "heartRateBpm": 140,
      "temperatureC": 36.8
    },
    "maternalDetails": {
      "maternalAgeYears": 30,
      "parity": "G1P1",
      "location": "Anytown General Hospital",
      "maternalEducation": "College",
      "deliveryMode": "Vaginal",
      "gestationalHistory": "No complications.",
      "gestationalAgeEstimationMethod": "Ultrasound"
    }
  }'
```

### 3. Check the result:
```bash
# View the index
cat backend/data/index.json

# View patient folder
ls backend/data/

# View patient data
cat backend/data/baby_john_*/patient.json
```

## 📊 Data Fields Reference

### Baby Details:
- `gestationalAge` - e.g., "39 weeks"
- `weightKg` - Birth weight in kg
- `sex` - "Male" or "Female"
- `heartRateBpm` - Heart rate
- `temperatureC` - Temperature in Celsius

### Maternal Details:
- `maternalAgeYears` - Mother's age
- `parity` - e.g., "G1P1"
- `location` - Hospital/clinic name
- `maternalEducation` - Education level
- `deliveryMode` - "Vaginal" or "C-Section"
- `gestationalHistory` - Pregnancy notes
- `gestationalAgeEstimationMethod` - How age was estimated

## ✨ Benefits

✅ **Organized**: Each patient in their own folder
✅ **Scalable**: No single large JSON file
✅ **Human-readable**: Folders named after patients
✅ **Extensible**: Easy to add more files per patient
✅ **Fast**: Index file for quick listing
✅ **Backup-friendly**: Backup individual patients

## 🔮 Future Extensions

You can easily add to each patient folder:
```
baby_john_a1b2c3d4/
├── patient.json                 # Patient data (✅ current)
├── images/                      # Store images here (future)
│   ├── face.jpg
│   └── ear.jpg
├── reports/                     # Medical reports (future)
│   └── assessment.pdf
└── notes.txt                    # Doctor notes (future)
```

## 🧪 Testing

All existing API endpoints work the same:

- ✅ `GET /api/patients` - List all patients
- ✅ `GET /api/patients/:id` - Get patient by ID
- ✅ `POST /api/patients` - Create patient
- ✅ `PUT /api/patients/:id` - Update patient
- ✅ `DELETE /api/patients/:id` - Delete patient (removes folder)
- ✅ `GET /api/patients/search?q=query` - Search patients

## 📚 Documentation

- **DATA_STRUCTURE.md** - Complete data structure documentation
- **backend/data/example_patient_structure.md** - Examples and cURL commands

## ⚠️ Migration Note

If you had patients in the old `patients.json` file:
- They will NOT be automatically migrated
- The old file is ignored by the new system
- You can manually recreate patients via the API
- Or write a migration script if needed

The new system starts fresh with an empty `index.json`.

---

**Your patient data is now organized with each patient in their own folder! 🎉**
