const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGODB_URI;

console.log('--- MongoDB Connectivity Debug Tool ---');
console.log(`Connecting to: ${uri ? uri.split('@')[1] : 'UNDEFINED'}`);

if (!uri) {
    console.error('❌ MONGODB_URI is not defined in .env file');
    process.exit(1);
}

const options = {
    serverSelectionTimeoutMS: 5000,
};

async function debugConnection() {
    try {
        console.log('⌛ Attempting to connect...');
        await mongoose.connect(uri, options);
        console.log('✅ SUCCESS: Connected to MongoDB Atlas successfully.');
        
        // List collections to verify access
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`📂 Found ${collections.length} collections.`);
        
        await mongoose.disconnect();
        console.log('👋 Disconnected.');
        process.exit(0);
    } catch (error) {
        console.error('❌ FAILURE: Could not connect to MongoDB.');
        console.error('Error Details:');
        console.error('  Code:', error.code);
        console.error('  Message:', error.message);
        
        if (error.code === 'ETIMEOUT' && error.syscall === 'querySrv') {
            console.log('\n💡 DIAGNOSIS: DNS/SRV Timeout');
            console.log('Symptoms: Your system cannot resolve the _mongodb._tcp DNS records.');
            console.log('Common Fixes:');
            console.log('1. Change your DNS to Google (8.8.8.8) or Cloudflare (1.1.1.1).');
            console.log('2. If using a VPN or corporate network, it might be blocking port 27017 or SRV lookups.');
            console.log('3. Ensure your IP is whitelisted in MongoDB Atlas Network Access.');
        }
        
        process.exit(1);
    }
}

debugConnection();
