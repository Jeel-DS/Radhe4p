const axios = require('axios');

// Login as a worker to get token (simulated or manual)
// For this script, I'll assume I can just hit the endpoints if I had a token.
// Since I can't easily login via script without credentials, I'll inspect the code deeper.
// Wait, I can use the `run_command` to run a curl if I knew a token, but I don't.
// I will instead create a script that connects to mongoose and checks the queries directly to see if they work.

const mongoose = require('mongoose');
require('dotenv').config({ path: 'd:\\Radhe4p\\backend\\.env' });

const User = require('d:\\Radhe4p\\backend\\models\\User');
const Dealer = require('d:\\Radhe4p\\backend\\models\\Dealer');
const DiamondType = require('d:\\Radhe4p\\backend\\models\\DiamondType');
const WorkRequest = require('d:\\Radhe4p\\backend\\models\\WorkRequest');
const Advance = require('d:\\Radhe4p\\backend\\models\\Advance');

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check Dealers
        const dealers = await Dealer.find({ active: true }).select('name');
        console.log(`Dealers found: ${dealers.length}`);

        // Check Diamond Types
        const types = await DiamondType.find({ active: true }).select('name');
        console.log(`Diamond Types found: ${types.length}`);

        // Check/Find a worker
        const worker = await User.findOne({ role: 'worker' });
        if (worker) {
            console.log(`Worker found: ${worker.email}`);

            // Check Earnings
            const earnings = await WorkRequest.find({ worker: worker._id, status: 'approved' });
            console.log(`Earnings found: ${earnings.length}`);

            // Check Advances
            const advances = await Advance.find({ worker: worker._id });
            console.log(`Advances found: ${advances.length}`);

            // Check Employee of Week
            const eow = await User.findOne({ role: 'worker', isEmployeeOfWeek: true });
            console.log(`Employee of Week: ${eow ? eow.name : 'None'}`);
        } else {
            console.log('No worker found');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkData();
