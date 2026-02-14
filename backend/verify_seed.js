const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Dealer = require('./models/Dealer');
const DiamondType = require('./models/DiamondType');

async function verifyData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Verify Workers
        const workers = await User.find({ role: 'worker' }).sort({ name: 1 });
        console.log(`\nTotal Workers: ${workers.length}`);
        workers.forEach(w => console.log(`- ${w.name} (${w.email})`));

        // Verify Dealers
        const dealers = await Dealer.find({}).sort({ name: 1 });
        console.log(`\nTotal Dealers: ${dealers.length}`);
        dealers.forEach(d => console.log(`- ${d.name}`));

        // Verify Diamond Types
        const types = await DiamondType.find({}).sort({ name: 1 });
        console.log(`\nTotal Diamond Types: ${types.length}`);
        types.forEach(t => console.log(`- ${t.name}`));

    } catch (error) {
        console.error('Error verifying data:', error);
    } finally {
        await mongoose.disconnect();
    }
}

verifyData();
