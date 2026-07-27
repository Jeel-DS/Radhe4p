const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require('dns');
const https = require('https');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const workerRoutes = require('./routes/worker');
const managerRoutes = require('./routes/manager');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── MongoDB Connection ───────────────────────────────────────────────────────
// Use Google DNS-over-HTTPS to resolve the Atlas SRV record, bypassing
// ISP DNS servers that block SRV lookups (ENOTFOUND / querySrv errors).
function resolveSRVviaDOH(hostname) {
  return new Promise((resolve, reject) => {
    const url = `https://dns.google/resolve?name=${hostname}&type=SRV`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (!json.Answer || json.Answer.length === 0) return reject(new Error('No SRV records found'));
          resolve(json.Answer);
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function connectMongoDB() {
  const uri = process.env.MONGODB_URI || '';

  // Try direct connection first (no SRV needed)
  if (!uri.startsWith('mongodb+srv://')) {
    return mongoose.connect(uri, { serverSelectionTimeoutMS: 30000, family: 4 });
  }

  // Extract cluster host from mongodb+srv URI
  const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?]+)(.*)/);
  if (!match) throw new Error('Invalid MONGODB_URI format');
  const [, user, pass, srvHost, rest] = match;

  console.log('🔍 Resolving MongoDB SRV via Google DNS-over-HTTPS...');
  try {
    const answers = await resolveSRVviaDOH(`_mongodb._tcp.${srvHost}`);
    const hosts = answers.map(a => {
      const parts = a.data.trim().split(' ');
      const host = parts[3].replace(/\.$/, '');
      const port = parts[2];
      return `${host}:${port}`;
    }).join(',');

    // Parse extra query params from original URI
    const queryStr = rest.includes('?') ? rest.split('?')[1] : 'retryWrites=true&w=majority';
    const dbName = rest.includes('/') ? rest.split('/')[1].split('?')[0] : 'radhe4p';

    const directURI = `mongodb://${user}:${pass}@${hosts}/${dbName}?ssl=true&authSource=admin&${queryStr}`;
    console.log('✅ SRV resolved — connecting with direct URI...');
    return mongoose.connect(directURI, { serverSelectionTimeoutMS: 30000, family: 4, tls: true });
  } catch (srvErr) {
    console.warn('⚠️  DoH SRV resolution failed, falling back to original URI...');
    // Last resort: try plain dns override then original URI
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    return mongoose.connect(uri, { serverSelectionTimeoutMS: 30000, family: 4 });
  }
}

connectMongoDB()
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:');
    console.error('   ', err.message);
    console.error('ℹ️  ACTION REQUIRED: Go to https://cloud.mongodb.com → Network Access');
    console.error('   and add your current IP address (or 0.0.0.0/0 for any IP).');
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/worker', workerRoutes);
app.use('/api/manager', managerRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Radhe 4P API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Only start listening when running directly (local dev), not as a Vercel serverless function
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
