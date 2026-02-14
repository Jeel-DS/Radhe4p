const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Dealer = require('./models/Dealer');
const DiamondType = require('./models/DiamondType');

// Worker Data
const workers = [
    { name: 'Bharat', email: 'Bharat@radhe4p', password: 'Bharat10' },
    { name: 'Kaushik', email: 'Kaushik@radhe4p', password: 'Kaushik20' },
    { name: 'Rajdeep', email: 'Rajdeep@radhe4p', password: 'Rajdeep30' },
    { name: 'Vishal', email: 'Vishal@radhe4p', password: 'Vishal40' },
    { name: 'Rahul', email: 'Rahul@radhe4p', password: 'Rahul50' },
    { name: 'Kamlesh', email: 'Kamlesh@radhe4p', password: 'Kamlesh60' },
    { name: 'Dhima', email: 'Dhima@radhe4p', password: 'Dhima70' },
    { name: 'Sadhana', email: 'Sadhana@radhe4p', password: 'Sadhana80' },
    { name: 'Vishnu', email: 'Vishnu@radhe4p', password: 'Vishnu90' },
    { name: 'Sarad', email: 'Sarad@radhe4p', password: 'Sarad100' }
];

// Dealer Data
const dealers = ['K J', 'A V', 'Sairam'];

// Diamond Types
const diamondTypes = [
    { name: 'Jada', description: 'Type 1' },
    { name: 'Patla', description: 'Type 2' }
];

async function seedData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Ensure a Manager exists (needed for dealers createdBy)
        let manager = await User.findOne({ role: 'manager' });
        if (!manager) {
            console.log('No manager found. Creating a default manager...');
            manager = await User.create({
                name: 'Manager',
                email: 'manager@radhe4p',
                password: 'password123',
                role: 'manager'
            });
            console.log('Manager created.');
        } else {
            console.log('Manager found:', manager.email);
        }

        // 2. Seed Workers
        console.log('Seeding Workers...');
        for (const workerData of workers) {
            const existingWorker = await User.findOne({ email: workerData.email.toLowerCase() });
            if (!existingWorker) {
                await User.create({
                    name: workerData.name,
                    email: workerData.email,
                    password: workerData.password, // Schema hook will hash this
                    role: 'worker'
                });
                console.log(`Created worker: ${workerData.name}`);
            } else {
                console.log(`Worker already exists: ${workerData.name}`);
            }
        }

        // 3. Seed Diamond Types
        console.log('Seeding Diamond Types...');
        for (const typeData of diamondTypes) {
            const existingType = await DiamondType.findOne({ name: typeData.name });
            if (!existingType) {
                await DiamondType.create(typeData);
                console.log(`Created Diamond Type: ${typeData.name}`);
            } else {
                console.log(`Diamond Type already exists: ${typeData.name}`);
            }
        }

        // 4. Seed Dealers
        console.log('Seeding Dealers...');
        for (const dealerName of dealers) {
            const existingDealer = await Dealer.findOne({ name: dealerName });
            if (!existingDealer) {
                await Dealer.create({
                    name: dealerName,
                    createdBy: manager._id,
                    active: true
                });
                console.log(`Created Dealer: ${dealerName}`);
            } else {
                console.log(`Dealer already exists: ${dealerName}`);
            }
        }

        console.log('Seeding completed successfully.');

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

seedData();
