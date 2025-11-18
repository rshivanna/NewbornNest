# Quick Start Guide

## Project Structure

Your project has been successfully restructured into a monorepo with separate frontend and backend:

```
newborn-nest-app/
├── frontend/          # React frontend (port 8080)
├── backend/           # Express backend (port 3000)
├── package.json       # Root workspace config
└── README.md          # Full documentation
```

## Getting Started

### 1. Start the Backend Server

```bash
cd backend
npm run dev
```

The backend will start on **http://localhost:3000**

You should see:
```
📁 Using local file storage
🚀 Server is running on http://localhost:3000
📁 Environment: development
```

### 2. Start the Frontend (in a new terminal)

```bash
cd frontend
npm run dev
```

The frontend will start on **http://localhost:8080**

### 3. Access the Application

Open your browser and navigate to:
**http://localhost:8080**

## Quick Commands

### Run Both (Recommended)
From the root directory:
```bash
npm run dev
```
This will start both backend and frontend concurrently.

### Individual Commands

**Backend only:**
```bash
npm run dev:backend
```

**Frontend only:**
```bash
npm run dev:frontend
```

## What's New

### Backend Features
- RESTful API on port 3000
- File-based patient storage (JSON files in `backend/data/`)
- File upload support (local storage by default)
- AWS S3 integration (optional - configure in `backend/.env`)

### Frontend Updates
- Now uses TanStack Query for data fetching
- Connected to backend API
- Real-time data synchronization
- Improved error handling and loading states

### API Endpoints

- `GET /api/patients` - Get all patients
- `GET /api/patients/search?q=query` - Search patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `POST /api/files/upload` - Upload file

## Configuration

### Backend (.env)
Located at `backend/.env`:
- `PORT=3000` - Backend port
- `FRONTEND_URL=http://localhost:8080` - Frontend URL for CORS
- AWS credentials (optional for S3 storage)

### Frontend (.env)
Located at `frontend/.env`:
- `VITE_API_URL=http://localhost:3000/api` - Backend API URL

## Troubleshooting

### Backend won't start
- Check if port 3000 is available
- Ensure all dependencies are installed: `cd backend && npm install`
- Check `backend/.env` file exists

### Frontend won't connect to backend
- Ensure backend is running on port 3000
- Check `frontend/.env` has correct `VITE_API_URL`
- Check browser console for CORS errors

### CORS errors
- Verify `FRONTEND_URL` in `backend/.env` matches your frontend URL
- Restart backend after changing .env

## File Storage

By default, the app uses **local file storage**:
- Uploaded files: `backend/uploads/`
- Patient data: `backend/data/patients.json`

To use **AWS S3**, configure these in `backend/.env`:
```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name
```

## Next Steps

1. **Start developing**: Add new features to frontend or backend
2. **Deploy**: See README.md for deployment instructions
3. **Configure S3**: Set up AWS S3 for production file storage
4. **Add database**: Replace JSON file storage with a real database (MongoDB, PostgreSQL)

## Need Help?

- Full documentation: See [README.md](./README.md)
- Backend code: `backend/src/`
- Frontend code: `frontend/src/`
- API documentation: See README.md API section

Enjoy building! 🚀
