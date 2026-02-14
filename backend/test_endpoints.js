const axios = require('axios');
require('dotenv').config({ path: 'd:\\Radhe4p\\backend\\.env' });

const API_URL = 'http://localhost:5000/api';
let token = '';

async function testEndpoints() {
    try {
        // 1. Login as Manager
        console.log('Logging in as Manager...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'manager@radhe4p.com',
            password: 'manager123'
        });
        token = loginRes.data.token;
        console.log('Login successful.');

        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Test Get Advances
        console.log('Testing GET /manager/advances...');
        const advancesRes = await axios.get(`${API_URL}/manager/advances`, config);
        console.log(`Advances found: ${advancesRes.data.advances.length}`);

        // 3. Test Create Dealer Transaction
        console.log('Testing POST /manager/dealer-transactions...');
        // Need a dealer and diamond type ID first
        const dealersRes = await axios.get(`${API_URL}/manager/dealers`, config);
        const typesRes = await axios.get(`${API_URL}/manager/diamond-types`, config);

        if (dealersRes.data.dealers.length > 0 && typesRes.data.diamondTypes.length > 0) {
            const dealerId = dealersRes.data.dealers[0]._id;
            const typeId = typesRes.data.diamondTypes[0]._id;

            const transRes = await axios.post(`${API_URL}/manager/dealer-transactions`, {
                dealer: dealerId,
                diamondType: typeId,
                count: 50,
                pricePerDiamond: 100,
                date: new Date()
            }, config);
            console.log('Transaction created:', transRes.data.transaction._id);
        } else {
            console.log('Skipping transaction creation (no dealer/type found).');
        }

        // 4. Test Get Dealer Transactions
        console.log('Testing GET /manager/dealer-transactions...');
        const getTransRes = await axios.get(`${API_URL}/manager/dealer-transactions`, config);
        console.log(`Transactions found: ${getTransRes.data.transactions.length}`);

        // 5. Test Profit
        console.log('Testing GET /manager/profit...');
        const profitRes = await axios.get(`${API_URL}/manager/profit`, config);
        console.log('Profit Data:', profitRes.data.profit);

    } catch (error) {
        console.error('Error testing endpoints:', error.response ? error.response.data : error.message);
    }
}

testEndpoints();
