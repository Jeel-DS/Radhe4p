# MongoDB Atlas Connection Troubleshooting

## Current Issues
You're experiencing SSL/TLS connection errors with MongoDB Atlas. Here's how to fix them:

## ✅ Solutions (Follow in Order)

### 1. Check IP Whitelist in MongoDB Atlas

**CRITICAL:** MongoDB Atlas requires you to whitelist IP addresses.

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Select your cluster "jeel"
3. Click **"Network Access"** in the left sidebar (under Security)
4. Click **"Add IP Address"**
5. For development, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - For production, add only your specific IP
6. Click **"Confirm"**

⏰ **Wait 2-3 minutes** for the change to propagate!

### 2. Verify Database User Credentials

1. In MongoDB Atlas, go to **"Database Access"** (under Security)
2. Verify user: `jeelpadsala15_db_user` exists
3. Verify the password is: `Mongo@Pass`
4. Ensure the user has **"Read and Write to any database"** privileges
5. If unsure, click **"Edit"** → Reset password → Use: `NewPass123`
   - Then update `.env` to: `...user:NewPass123@jeel...`

### 3. Use Alternative Connection String Format

If the above doesn't work, try the standard connection string instead of SRV:

**Current (SRV format):**
```
mongodb+srv://jeelpadsala15_db_user:Mongo%40Pass@jeel.dwk4i6x.mongodb.net/radhe4p?retryWrites=true&w=majority
```

**Alternative (Standard format):**
1. In MongoDB Atlas, click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Select **"Driver: Node.js"** and **"Version: 4.1 or later"**
4. Copy the connection string shown (it will start with `mongodb://` not `mongodb+srv://`)
5. Replace the connection string in your `.env` file

### 4. Check MongoDB Driver Compatibility

Your current Node.js version might have SSL/TLS compatibility issues. Try adding these options to the connection string:

```env
MONGODB_URI=mongodb+srv://jeelpadsala15_db_user:Mongo%40Pass@jeel.dwk4i6x.mongodb.net/radhe4p?retryWrites=true&w=majority&tls=true&tlsAllowInvalidCertificates=true
```

⚠️ **Note:** `tlsAllowInvalidCertificates=true` should only be used for development!

### 5. Alternative: Use Local MongoDB Instead

If MongoDB Atlas continues to have issues, use local MongoDB:

**Install MongoDB locally:**
- Download from: https://www.mongodb.com/try/download/community
- Or use Docker: `docker run -d -p 27017:27017 --name mongodb mongo:latest`

**Update `.env` to:**
```env
MONGODB_URI=mongodb://localhost:27017/radhe4p
```

## 🔧 Quick Fix Commands

After making changes to `.env`, restart the server:

```bash
# Stop current server (Ctrl+C in the terminal)
# Then restart:
npm start
```

## ✅ Test Connection

Once connected successfully, you should see:
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
```

Then seed the database:
```bash
npm run seed
```

## 📞 Still Having Issues?

1. Check MongoDB Atlas service status: https://status.cloud.mongodb.com/
2. Verify your cluster is running (not paused)
3. Try creating a new database user with a simpler password (e.g., `simplepass123`)
4. Ensure your cluster region is accessible from your location

---

**Most Common Fix:** Whitelist IP address (0.0.0.0/0) in Network Access and wait 2-3 minutes! ⏰
