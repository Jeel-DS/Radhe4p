const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const User = require('./models/User');
const Dealer = require('./models/Dealer');
const DiamondType = require('./models/DiamondType');

async function verifyData() {
    let output = '';
    const log = (msg) => { output += msg + '\n'; console.log(msg); };

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        log('Connected to MongoDB');

        // Verify Workers
        const workers = await User.find({ role: 'worker' }).sort({ name: 1 });
        log(`\nTotal Workers: ${workers.length}`);
        workers.forEach(w => log(`- ${w.name} (${w.email})`));

        // Verify Dealers
        const dealers = await Dealer.find({}).sort({ name: 1 });
        log(`\nTotal Dealers: ${dealers.length}`);
        dealers.forEach(d => log(`- ${d.name}`));

        // Verify Diamond Types
        const types = await DiamondType.find({}).sort({ name: 1 });
        log(`\nTotal Diamond Types: ${types.length}`);
        types.forEach(t => log(`- ${t.name}`));

        fs.writeFileSync('verification_output.txt', output);
        console.log('Output written to verification_output.txt');

    } catch (error) {
        log('Error verifying data: ' + error);
        fs.writeFileSync('verification_output.txt', output);
    } finally {
        await mongoose.disconnect();
    }
}

verifyData();
