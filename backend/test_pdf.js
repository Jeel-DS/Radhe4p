const mongoose = require('mongoose');
const { generateWorkerPDF } = require('./utils/pdfGenerator');
const User = require('./models/User');
const WorkRequest = require('./models/WorkRequest');
const Advance = require('./models/Advance');
const Dealer = require('./models/Dealer');
const DiamondType = require('./models/DiamondType');
require('dotenv').config();

async function testPDF() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/radhe4p');
        console.log('Connected to MongoDB');

        const worker = await User.findOne({ role: 'worker' });
        if (!worker) {
            console.log('No worker found to test');
            return;
        }
        console.log('Testing PDF for worker:', worker.name);

        const pdfBuffer = await generateWorkerPDF(worker._id);
        console.log('PDF generated successfully, buffer size:', pdfBuffer.length);

        process.exit(0);
    } catch (error) {
        console.error('PDF Generation Error:', error.stack);
        process.exit(1);
    }
}

testPDF();
