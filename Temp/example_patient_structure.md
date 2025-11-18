# Example Patient Data Structure

When you create a patient via the API with this data:

## Request Body:
```json
{
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
}
```

## What Gets Created:

### 1. Folder Structure:
```
backend/data/
├── baby_john_a1b2c3d4/           ← Folder for this patient
│   └── patient.json              ← Patient data file
└── index.json                    ← Updated with new entry
```

### 2. Index Entry (data/index.json):
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

### 3. Patient File (data/baby_john_a1b2c3d4/patient.json):
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
  "images": {},
  "folderName": "baby_john_a1b2c3d4",
  "folderPath": "/full/path/to/data/baby_john_a1b2c3d4",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

## Test with cURL:

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

## Folder Naming Examples:

| Baby Name | Folder Name |
|-----------|-------------|
| Baby John | `baby_john_a1b2c3d4` |
| Emma Rose | `emma_rose_e5f6g7h8` |
| José García | `jos_garca_i9j0k1l2` |
| Baby-123 | `baby123_m3n4o5p6` |

Special characters are removed, spaces become underscores, and a unique ID is appended.
