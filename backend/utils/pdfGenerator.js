const PDFDocument = require('pdfkit');
const WorkRequest = require('../models/WorkRequest');
const Advance = require('../models/Advance');
const User = require('../models/User');

// Helper to format currency
const formatCurrency = (amount) => `Rs. ${(amount || 0).toLocaleString()}`;

// Generate Manager PDF Report
async function generateManagerPDF(startDate = null, endDate = null) {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Fetch data
            let query = { status: 'approved' };
            if (startDate || endDate) {
                query.approvalDate = {};
                if (startDate) query.approvalDate.$gte = startDate;
                if (endDate) query.approvalDate.$lte = endDate;
            }

            const approvedRequests = await WorkRequest.find(query)
                .populate('worker', 'name email')
                .populate('dealer', 'name')
                .populate('diamondType', 'name')
                .sort({ approvalDate: -1 });

            const advances = await Advance.find(startDate || endDate ? {
                date: {
                    ...(startDate && { $gte: startDate }),
                    ...(endDate && { $lte: endDate })
                }
            } : {})
                .populate('worker', 'name email')
                .populate('manager', 'name')
                .sort({ date: -1 });

            // HEADER
            doc.fontSize(20).fillColor('#667eea').text('Radhe 4P Diamond Management System', { align: 'center' });
            doc.fontSize(16).fillColor('#333').text('Manager Overview Report', { align: 'center' });
            doc.moveDown();

            if (startDate || endDate) {
                doc.fontSize(10).fillColor('#666');
                let dateRange = 'Period: ';
                if (startDate) dateRange += `From ${startDate.toLocaleDateString()} `;
                if (endDate) dateRange += `To ${endDate.toLocaleDateString()}`;
                doc.text(dateRange, { align: 'center' });
                doc.moveDown();
            }

            doc.fontSize(9).fillColor('#999').text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
            doc.moveDown(1.5);

            // SUMMARY
            const totalEarnings = approvedRequests.reduce((sum, req) => sum + (req.totalEarning || 0), 0);
            const totalAdvances = advances.reduce((sum, adv) => sum + adv.amount, 0);

            doc.rect(50, doc.y, 500, 60).fill('#f3f4f6');
            doc.fillColor('#333').fontSize(12).text('Summary Statistics', 70, doc.y + 10);
            doc.fontSize(10);
            doc.text(`Total Approved Requests: ${approvedRequests.length}`, 70, doc.y + 5);
            doc.text(`Total Payments: ${formatCurrency(totalEarnings)}`, 250, doc.y - 12);
            doc.text(`Total Advances: ${formatCurrency(totalAdvances)}`, 250, doc.y + 2);
            doc.moveDown(3);

            // TABLES
            // (Similar styled tables as worker report but for manager data)
            // For brevity and to ensure it works, I'll use a clean layout

            doc.fontSize(14).fillColor('#333').text('Work History', 50, doc.y);
            doc.moveDown(0.5);

            if (approvedRequests.length === 0) {
                doc.fontSize(10).fillColor('#777').text('No approved requests found.');
            } else {
                let y = doc.y;
                const itemHeight = 20;
                doc.fillColor('#667eea').rect(50, y, 500, itemHeight).fill();
                doc.fillColor('#fff').fontSize(8);
                doc.text('Date', 60, y + 6);
                doc.text('Worker', 130, y + 6);
                doc.text('Dealer', 230, y + 6);
                doc.text('Price', 330, y + 6);
                doc.text('Total', 430, y + 6);

                y += itemHeight;
                doc.fillColor('#333');
                approvedRequests.forEach((req, i) => {
                    if (y > 700) { doc.addPage(); y = 50; }
                    if (i % 2 === 1) doc.fillColor('#f9fafb').rect(50, y, 500, itemHeight).fill();
                    doc.fillColor('#333');
                    doc.text(new Date(req.approvalDate).toLocaleDateString(), 60, y + 6);
                    doc.text(req.worker?.name || '-', 130, y + 6);
                    doc.text(req.dealer?.name || '-', 230, y + 6);
                    doc.text(formatCurrency(req.assignedPrice), 330, y + 6);
                    doc.text(formatCurrency(req.totalEarning), 430, y + 6);
                    y += itemHeight;
                });
                doc.y = y + 20;
            }

            doc.end();
        } catch (e) {
            reject(e);
        }
    });
}

// Generate Worker PDF Report
async function generateWorkerPDF(workerId, startDate = null, endDate = null) {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            const worker = await User.findById(workerId).select('name email');
            if (!worker) throw new Error('Worker not found');

            let query = { worker: workerId, status: 'approved' };
            if (startDate || endDate) {
                query.approvalDate = {};
                if (startDate) query.approvalDate.$gte = startDate;
                if (endDate) query.approvalDate.$lte = endDate;
            }

            const earnings = await WorkRequest.find(query)
                .populate('dealer', 'name')
                .populate('diamondType', 'name')
                .sort({ approvalDate: -1 });

            const advances = await Advance.find({
                worker: workerId,
                ...(startDate || endDate ? {
                    date: {
                        ...(startDate && { $gte: startDate }),
                        ...(endDate && { $lte: endDate })
                    }
                } : {})
            }).populate('manager', 'name').sort({ date: -1 });

            // HEADER
            doc.fontSize(20).fillColor('#667eea').text('Radhe 4P Diamond Management System', { align: 'center' });
            doc.fontSize(16).fillColor('#333').text('Worker Financial Report', { align: 'center' });
            doc.moveDown();

            doc.fontSize(12).fillColor('#555').text(`Worker: ${worker.name}`, { align: 'center' });
            doc.fontSize(10).fillColor('#777').text(worker.email, { align: 'center' });
            doc.moveDown();

            if (startDate || endDate) {
                doc.fontSize(10).fillColor('#666');
                let dateRange = 'Period: ';
                if (startDate) dateRange += `From ${startDate.toLocaleDateString()} `;
                if (endDate) dateRange += `To ${endDate.toLocaleDateString()}`;
                doc.text(dateRange, { align: 'center' });
                doc.moveDown();
            }

            doc.fontSize(9).fillColor('#999').text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
            doc.moveDown(1.5);

            // FINANCIAL SUMMARY
            const totalEarnings = earnings.reduce((sum, e) => sum + (e.totalEarning || 0), 0);
            const totalAdvances = advances.reduce((sum, a) => sum + a.amount, 0);
            const netAmount = totalEarnings - totalAdvances;

            doc.rect(50, doc.y, 500, 85).fill('#f9fafb');
            doc.fillColor('#333').fontSize(14).text('Financial Summary', 70, doc.y + 15);

            doc.fontSize(11);
            doc.text('Total Earnings:', 70, doc.y + 10);
            doc.text(formatCurrency(totalEarnings), 400, doc.y, { align: 'right' });

            doc.text('Total Advances Received:', 70, doc.y + 10);
            doc.text(formatCurrency(totalAdvances), 400, doc.y, { align: 'right' });

            doc.lineWidth(1).strokeColor('#ddd').moveTo(70, doc.y + 10).lineTo(480, doc.y + 10).stroke();

            doc.fontSize(12).font('Helvetica-Bold');
            doc.text('Net Payable Amount:', 70, doc.y + 15);
            doc.fillColor(netAmount >= 0 ? '#059669' : '#dc2626');
            doc.text(formatCurrency(netAmount), 400, doc.y, { align: 'right' });

            doc.font('Helvetica').moveDown(4);

            // EARNINGS TABLE
            doc.fontSize(14).fillColor('#333').text('Earnings History', 50, doc.y);
            doc.moveDown(0.5);

            if (earnings.length === 0) {
                doc.fontSize(10).fillColor('#777').text('No earnings records found.');
            } else {
                let y = doc.y;
                const itemHeight = 20;
                doc.fillColor('#667eea').rect(50, y, 500, itemHeight).fill();
                doc.fillColor('#fff').fontSize(9);
                doc.text('Date', 60, y + 6);
                doc.text('Dealer', 140, y + 6);
                doc.text('Type', 240, y + 6);
                doc.text('Count', 340, y + 6);
                doc.text('Total', 440, y + 6);

                y += itemHeight;
                doc.fillColor('#333');
                earnings.forEach((e, i) => {
                    if (y > 700) { doc.addPage(); y = 50; }
                    if (i % 2 === 1) doc.fillColor('#f4f6f8').rect(50, y, 500, itemHeight).fill();
                    doc.fillColor('#333');
                    doc.text(new Date(e.approvalDate).toLocaleDateString(), 60, y + 6);
                    doc.text(e.dealer?.name || '-', 140, y + 6);
                    doc.text(e.diamondType?.name || '-', 240, y + 6);
                    doc.text(e.diamondCount?.toString(), 340, y + 6);
                    doc.text(formatCurrency(e.totalEarning), 440, y + 6);
                    y += itemHeight;
                });
                doc.y = y + 20;
            }

            // ADVANCES TABLE
            doc.fontSize(14).fillColor('#333').text('Advances History', 50, doc.y);
            doc.moveDown(0.5);

            if (advances.length === 0) {
                doc.fontSize(10).fillColor('#777').text('No advances records found.');
            } else {
                let y = doc.y;
                const itemHeight = 20;
                doc.fillColor('#667eea').rect(50, y, 500, itemHeight).fill();
                doc.fillColor('#fff').fontSize(9);
                doc.text('Date', 60, y + 6);
                doc.text('Amount', 200, y + 6);
                doc.text('Given By', 350, y + 6);

                y += itemHeight;
                doc.fillColor('#333');
                advances.forEach((a, i) => {
                    if (y > 700) { doc.addPage(); y = 50; }
                    if (i % 2 === 1) doc.fillColor('#f4f6f8').rect(50, y, 500, itemHeight).fill();
                    doc.fillColor('#333');
                    doc.text(new Date(a.date).toLocaleDateString(), 60, y + 6);
                    doc.text(formatCurrency(a.amount), 200, y + 6);
                    doc.text(a.manager?.name || '-', 350, y + 6);
                    y += itemHeight;
                });
            }

            // FOOTER (Page Numbers)
            const range = doc.bufferedPageRange();
            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);
                doc.fontSize(8).fillColor('#999');
                doc.text(`Radhe 4P Diamond Management System - Page ${i + 1}`, 50, 750, { align: 'center' });
            }

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
