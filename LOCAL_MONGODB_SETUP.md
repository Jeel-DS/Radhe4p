# Quick Fix: Use Local MongoDB

## The Problem
MongoDB Atlas is having SSL/TLS connection issues. This is a common problem with:
- IP whitelist not configured
- Network/firewall restrictions
- SSL certificate compatibility

## ⚡ FASTEST Solution: Use Local MongoDB

### Option 1: MongoDB Compass (Easiest - GUI Tool)

1. **Download MongoDB Compass** (includes local MongoDB):
   - https://www.mongodb.com/try/download/compass
   - Install it (includes local MongoDB server)

2. **Start MongoDB Compass**
   - It will automatically start a local MongoDB server
   - Connection string: `mongodb://localhost:27017`

3. **Update your `.env`:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/radhe4p
   ```

### Option 2: Docker (If you have Docker installed)

```bash
# Start MongoDB container
docker run -d -p 27017:27017 --name radhe4p-mongo mongo:latest

# Verify it's running
docker ps
```

Then update `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/radhe4p
```

### Option 3: Install MongoDB Community Server

1. Download: https://www.mongodb.com/try/download/community
2. Install for Windows
3. MongoDB will run as a service automatically
4. Update `.env` as shown above

## ✅ After Setup

Once you've chosen an option and updated `.env`:

```bash
# From backend/utils directory
node seedDatabase.js

# Or from backend directory
npm run seed
```

You should see:
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

Then start your servers:
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev
```

## 🌐 Access Application

Open: **http://localhost:3000**

Login with:
- **Manager**: manager@radhe4p.com / manager123
- **Worker**: worker@radhe4p.com / worker123

---

**Recommendation**: Use MongoDB Compass - it's the easiest and comes with a nice GUI to view your data!
