# Newborn Nest App - Patient Management System

A full-stack patient management system for newborn care, built with React (frontend) and Node.js/Express (backend).

## Project Structure

```
newborn-nest-app/
├── frontend/          # React + TypeScript + Vite frontend
├── backend/           # Node.js + Express backend
├── package.json       # Root workspace configuration
└── README.md          # This file
```

## Tech Stack

### Frontend
- **Framework**: React 18.3.1 + TypeScript
- **Build Tool**: Vite 5.4
- **UI Library**: shadcn-ui (built on Radix UI)
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Data Fetching**: TanStack Query
- **Forms**: React Hook Form + Zod validation

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Storage**: File system (JSON files) + AWS S3
- **File Upload**: Multer
- **Authentication**: None (as per requirements)
- **Database**: None (using file-based storage)

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- (Optional) AWS account for S3 storage

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd newborn-nest-app
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```
   Or install individually:
   ```bash
   # Install root dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the `backend` directory:
   ```bash
   cp backend/.env.example backend/.env
   ```

   Edit `backend/.env` and configure:
   ```env
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:8080

   # AWS S3 (optional - leave empty for local storage)
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your_bucket_name
   ```

### Running the Application

#### Option 1: Run both frontend and backend concurrently
```bash
npm run dev
```

#### Option 2: Run separately

**Backend** (runs on http://localhost:3000):
```bash
npm run dev:backend
```

**Frontend** (runs on http://localhost:8080):
```bash
npm run dev:frontend
```

### Building for Production

**Build frontend**:
```bash
npm run build
```

**Run production backend**:
```bash
npm run start:backend
```

## API Endpoints

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/search?q={query}` - Search patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### File Upload
- `POST /api/files/upload` - Upload single file
- `POST /api/files/upload-multiple` - Upload multiple files
- `GET /api/files/:fileName` - Get file
- `DELETE /api/files/:fileName` - Delete file

### Health Check
- `GET /api/health` - Server health check

## File Storage

The backend supports two storage modes:

1. **Local Storage** (default): Files stored in `backend/uploads/`
2. **AWS S3**: Configure AWS credentials in `.env` to enable

The system automatically detects which mode to use based on environment variables.

## Development

### Frontend Development
- Navigate to `frontend/` directory
- Run `npm run dev` for development server
- Access at http://localhost:8080
- Hot module replacement enabled

### Backend Development
- Navigate to `backend/` directory
- Run `npm run dev` for development server with auto-restart
- Access at http://localhost:3000
- Uses nodemon for auto-reload on file changes

## Project Features

- Patient registration and management
- Image upload (camera capture + file upload)
- Patient search functionality
- Responsive UI with shadcn-ui components
- File storage with local/S3 support
- RESTful API architecture

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install dependencies for all workspaces |
| `npm run dev` | Run both frontend and backend in dev mode |
| `npm run dev:frontend` | Run frontend dev server only |
| `npm run dev:backend` | Run backend dev server only |
| `npm run build` | Build frontend for production |
| `npm run start:backend` | Start backend in production mode |

## Troubleshooting

### Port already in use
If ports 3000 or 8080 are in use, update:
- Backend port: Edit `backend/.env` (PORT variable)
- Frontend port: Edit `frontend/vite.config.ts` (server.port)

### File upload errors
- Check `backend/uploads/` directory exists and is writable
- Verify `MAX_FILE_SIZE` in `backend/.env`
- For S3: Verify AWS credentials and bucket permissions

### CORS errors
- Ensure `FRONTEND_URL` in `backend/.env` matches your frontend URL
- Check that backend is running on the correct port

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
