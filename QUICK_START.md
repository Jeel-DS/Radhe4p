# Quick Start Guide - Radhe 4P

## Prerequisites
1. Install Node.js (v16+) from https://nodejs.org
2. Install MongoDB:
   - **Option A**: Download from https://www.mongodb.com/try/download/community
   - **Option B**: Use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas
   - **Option C**: Docker: `docker run -d -p 27017:27017 --name mongodb mongo:latest`

## Setup Steps

### 1. Start MongoDB
Make sure MongoDB is running on `mongodb://localhost:27017` or update the connection string in `backend/.env`

### 2. Seed Database
```bash
cd backend
npm run seed
```

Expected output:
```
✅ Connected to MongoDB
🗑️  Cleared existing data
✅ Created manager account
✅ Created worker accounts
✅ Created dealers
✅ Created diamond types
✅ Created sample prices
🎉 Database seeded successfully!
```

### 3. Start Backend Server
```bash
cd backend
npm run dev
```

Server will start on http://localhost:5000

### 4. Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
```

Frontend will start on http://localhost:3000

### 5. Login
Navigate to http://localhost:3000

Use these credentials:
- **Manager**: manager@radhe4p.com / manager123
- **Worker**: worker@radhe4p.com / worker123

## Troubleshooting

**MongoDB Connection Failed?**
- Ensure MongoDB is running
- Check connection string in `backend/.env`
- For MongoDB Atlas, whitelist your IP address

**Port Already in Use?**
- Backend (5000): Change `PORT` in `backend/.env`
- Frontend (3000): Change `server.port` in `frontend/vite.config.js`

## Project Features
✅ Role-based authentication (Manager/Worker)
✅ Worker: Submit requests, view earnings, track advances
✅ Manager: Approve requests, manage dealers/prices, give advances
✅ Excel report generation
✅ Modern responsive UI
