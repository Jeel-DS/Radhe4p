const PDFDocument = require('pdfkit');
const WorkRequest = require('../models/WorkRequest');
const Advance = require('../models/Advance');
const User = require('../models/User');

async function generateManagerPDF(startDate = null, endDate = null) {
    return Buffer.from('Manager Report Mock');
}

async function generateWorkerPDF(workerId, startDate = null, endDate = null) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => {
                const buffer = Buffer.concat(chunks);
                console.log('PDF Generation finished. Buffer size:', buffer.length);
                resolve(buffer);
            });
            doc.on('error', reject);

            console.log('Generating PDF for worker:', workerId);
            doc.fontSize(20).text('Worker Report', { align: 'center' });
            doc.moveDown();
            doc.text(`Worker ID: ${workerId}`);

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    generateManagerPDF,
    generateWorkerPDF
};
