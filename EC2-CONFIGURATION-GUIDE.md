# EC2 Configuration Guide - Frontend Not Finding Backend

## The Problem

When users access your frontend in their browser, `localhost` refers to **their computer**, not your EC2 instance! You need to use your **EC2 public IP or domain**.

---

## Step-by-Step Fix Instructions

### Step 1: Get Your EC2 Public IP

SSH into your EC2 instance and run:
```bash
curl http://169.254.169.254/latest/meta-data/public-ipv4
```

Save this IP address (e.g., `3.110.123.45`)

---

### Step 2: Update Frontend Configuration

Edit `frontend/.env`:
```bash
nano frontend/.env
```

Change line 1 from:
```env
VITE_API_URL=http://localhost:3000/api
```

To (replace with your actual IP):
```env
VITE_API_URL=http://YOUR_EC2_PUBLIC_IP:3000/api
```

Save and exit (Ctrl+O, Enter, Ctrl+X)

---

### Step 3: Update Backend Configuration

Edit `backend/.env`:
```bash
nano backend/.env
```

Uncomment line 21 and update it from:
```env
# FRONTEND_URL=http://localhost:8080
```

To (replace with your actual IP):
```env
FRONTEND_URL=http://YOUR_EC2_PUBLIC_IP:8080
```

Save and exit (Ctrl+O, Enter, Ctrl+X)

---

### Step 4: Rebuild Frontend

The frontend needs to be rebuilt with the new environment variable:
```bash
cd frontend
npm run build
```

---

### Step 5: Restart Backend

```bash
cd ../backend

# If running with pm2:
pm2 restart all

# If running with node:
pkill node
node src/server.js

# Or if running with npm:
npm start
```

---

### Step 6: Verify EC2 Security Group

In AWS Console, ensure your security group allows:
- **Port 3000** (HTTP) - Source: `0.0.0.0/0` (or your IP)
- **Port 8080** (HTTP) - Source: `0.0.0.0/0` (or your IP)

---

### Step 7: Test

Open in browser:
```
http://YOUR_EC2_PUBLIC_IP:8080
```

The frontend should now connect to the backend successfully!

---

## Alternative: Using Domain Name

If you have a domain name configured, use that instead of the IP address in both `.env` files:

**frontend/.env:**
```env
VITE_API_URL=https://yourdomain.com/api
```

**backend/.env:**
```env
FRONTEND_URL=https://yourdomain.com
```

---

## Configuration Files Summary

### Frontend Configuration Files:
- `frontend/.env` - Line 1: `VITE_API_URL`
- `frontend/src/api/client.ts` - Line 1: Uses `VITE_API_URL`
- `frontend/vite.config.ts` - Lines 8-10: Frontend server port (8080)

### Backend Configuration Files:
- `backend/.env` - Line 1: `PORT=3000`
- `backend/.env` - Line 21: `FRONTEND_URL` (CORS configuration)
- `backend/src/server.js` - Line 11: Port configuration
- `backend/src/server.js` - Lines 14-16: CORS configuration
