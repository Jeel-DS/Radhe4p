const mongoose = require('mongoose');
const dotenv = require('dotenv');
const https = require('https');
const path = require('path');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

function resolveSRVviaDOH(hostname) {
  return new Promise((resolve, reject) => {
    const url = `https://dns.google/resolve?name=${hostname}&type=SRV`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (!json.Answer || json.Answer.length === 0) return reject(new Error('No SRV records found: ' + JSON.stringify(json)));
          resolve(json.Answer);
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function connectMongoDB() {
  const uri = process.env.MONGODB_URI || '';
  console.log('Connecting to MongoDB...');

  if (!uri.startsWith('mongodb+srv://')) {
    return mongoose.connect(uri, { serverSelectionTimeoutMS: 30000 });
  }

  const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?]+)(.*)/);
  if (!match) throw new Error('Invalid MONGODB_URI format');
  const [, user, pass, srvHost, rest] = match;

  console.log(`🔍 Resolving _mongodb._tcp.${srvHost} via Google DNS-over-HTTPS...`);
  const answers = await resolveSRVviaDOH(`_mongodb._tcp.${srvHost}`);
  const hosts = answers.map(a => {
    const parts = a.data.trim().split(' ');
    const host = parts[3].replace(/\.$/, '');
    const port = parts[2];
    return `${host}:${port}`;
  }).join(',');

  const queryStr = rest.includes('?') ? rest.split('?')[1] : 'retryWrites=true&w=majority';
  const dbName = rest.includes('/') ? rest.split('/')[1].split('?')[0] : 'radhe4p';

  const directURI = `mongodb://${user}:${pass}@${hosts}/${dbName}?ssl=true&authSource=admin&${queryStr}`;
  console.log('✅ Resolved seed hosts:', hosts);
  return mongoose.connect(directURI, { serverSelectionTimeoutMS: 30000, tls: true, tlsAllowInvalidCertificates: true });
}

async function resetCredentials() {
  try {
    await connectMongoDB();
    console.log('✅ Connected to MongoDB Atlas!');

    // 1. Delete ALL existing users (login IDs)
    const deleteResult = await User.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing user account(s)`);

    // 2. Create Default Manager Account
    const manager = new User({
      name: 'Manager',
      email: 'manager@radhe4p.com',
      password: 'manager123',
      role: 'manager'
    });
    await manager.save();
    console.log('✅ Created Manager account: manager@radhe4p.com / manager123');

    // 3. Create Default Worker Account
    const worker = new User({
      name: 'Worker',
      email: 'worker@radhe4p.com',
      password: 'worker123',
      role: 'worker'
    });
    await worker.save();
    console.log('✅ Created Worker account: worker@radhe4p.com / worker123');

    console.log('\n🎉 Credentials successfully reset!');
    console.log('-----------------------------------');
    console.log('Manager: manager@radhe4p.com / manager123');
    console.log('Worker:  worker@radhe4p.com  / worker123');
    console.log('-----------------------------------');

    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ DETAILED ERROR:', error);
    process.exit(1);
  }
}

resetCredentials();
