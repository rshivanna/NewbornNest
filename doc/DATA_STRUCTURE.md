# Patient Data Structure Documentation

## Overview

Each patient is saved in their own dedicated folder with all related data organized together.

## Folder Structure

```
backend/data/
├── index.json                          # Quick index of all patients
├── baby_john_a1b2c3d4/                # Patient folder (sanitized name + unique ID)
│   └── patient.json                    # Patient data
├── baby_emma_e5f6g7h8/
│   └── patient.json
└── baby_sarah_i9j0k1l2/
    └── patient.json
```

## Index File (`backend/data/index.json`)

Quick reference for all patients. Used for fast listing without reading all files.

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "babyName": "Baby John",
    "motherName": "Jane Doe",
    "folderName": "baby_john_a1b2c3d4",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
]
```

## Patient Data File (`backend/data/{folderName}/patient.json`)

Complete patient record with all details:

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
  "folderPath": "/path/to/data/baby_john_a1b2c3d4",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

## Field Descriptions

### Top Level Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique UUID for the patient |
| `babyName` | string | Baby's name |
| `motherName` | string | Mother's name |
| `address` | string | Patient address |
| `folderName` | string | Name of the patient's data folder |
| `folderPath` | string | Full path to patient folder |
| `createdAt` | string | ISO timestamp when created |
| `updatedAt` | string | ISO timestamp of last update |

### Baby Details

| Field | Type | Description |
|-------|------|-------------|
| `gestationalAge` | string | Gestational age (e.g., "39 weeks") |
| `weightKg` | number | Birth weight in kilograms |
| `sex` | string | Baby's sex (Male/Female) |
| `heartRateBpm` | number | Heart rate in beats per minute |
| `temperatureC` | number | Body temperature in Celsius |

### Maternal Details

| Field | Type | Description |
|-------|------|-------------|
| `maternalAgeYears` | number | Mother's age in years |
| `parity` | string | Parity (e.g., "G1P1") |
| `location` | string | Hospital/location name |
| `maternalEducation` | string | Mother's education level |
| `deliveryMode` | string | Mode of delivery (Vaginal/C-Section) |
| `gestationalHistory` | string | Pregnancy history notes |
| `gestationalAgeEstimationMethod` | string | How gestational age was estimated |

### Images

| Field | Type | Description |
|-------|------|-------------|
| `face` | string | URL to face photo |
| `ear` | string | URL to ear photo |
| `foot` | string | URL to foot photo |
| `palm` | string | URL to palm photo |

## Folder Naming Convention

Patient folders are created using:
1. **Baby name** - Sanitized (lowercase, special chars removed, spaces → underscores)
2. **Unique ID** - First 8 characters of UUID
3. **Format**: `{sanitized_baby_name}_{unique_id}`

Examples:
- "Baby John" → `baby_john_a1b2c3d4`
- "Emma Rose Smith" → `emma_rose_smith_e5f6g7h8`
- "José García" → `jos_garca_i9j0k1l2` (special chars removed)

## Benefits of This Structure

✅ **Organized**: Each patient has their own folder
✅ **Scalable**: No single large JSON file
✅ **Extensible**: Easy to add more files per patient (reports, etc.)
✅ **Fast listing**: Index file for quick patient list
✅ **Human-readable**: Folders named after patients
✅ **Backup-friendly**: Can backup/restore individual patients

## Future Enhancements

You can easily extend each patient folder to include:
- `reports/` - Medical reports
- `images/` - Store images directly in patient folder
- `history.json` - Change history/audit trail
- `notes.txt` - Doctor's notes
- `attachments/` - Any other files

Example future structure:
```
baby_john_a1b2c3d4/
├── patient.json
├── images/
│   ├── face.jpg
│   ├── ear.jpg
│   └── foot.jpg
├── reports/
│   ├── initial_assessment.pdf
│   └── follow_up.pdf
└── notes.txt
```

## API Endpoints

All existing API endpoints work the same:

- `GET /api/patients` - List all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient (removes entire folder)

## Migration

If you have an old `patients.json` file, it will be ignored. The new system uses:
- `index.json` - Patient index
- Individual folders - Patient data

The system automatically creates these on first run.
