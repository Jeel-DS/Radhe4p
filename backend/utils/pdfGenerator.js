const PDFDocument = require('pdfkit');
const WorkRequest = require('../models/WorkRequest');
const Advance = require('../models/Advance');
const User = require('../models/User');

// Generate Manager PDF Report
async function generateManagerPDF(startDate = null, endDate = null) {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    // Collect PDF data
    doc.on('data', chunk => chunks.push(chunk));

    // Build query
    let query = {};
    if (startDate || endDate) {
        query.approvalDate = {};
        if (startDate) query.approvalDate.$gte = startDate;
        if (endDate) query.approvalDate.$lte = endDate;
    }

    // Fetch data
    const approvedRequests = await WorkRequest.find({ ...query, status: 'approved' })
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

    // Header
    doc.fontSize(20).fillColor('#667eea').text('Radhe 4P Management System', { align: 'center' });
    doc.fontSize(16).fillColor('#333').text('Manager Report', { align: 'center' });
    doc.moveDown();

    if (startDate || endDate) {
        doc.fontSize(10).fillColor('#666');
        if (startDate) doc.text(`From: ${startDate.toLocaleDateString()}`, { continued: true }).text(`  `, { continued: true });
        if (endDate) doc.text(`To: ${endDate.toLocaleDateString()}`);
        doc.moveDown();
    }

    doc.fontSize(10).fillColor('#999').text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.moveDown(2);

    // Summary Stats
    const totalEarnings = approvedRequests.reduce((sum, req) => sum + (req.totalEarning || 0), 0);
    const totalAdvances = advances.reduce((sum, adv) => sum + adv.amount, 0);

    doc.fontSize(14).fillColor('#333').text('Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Total Approved Requests: ${approvedRequests.length}`);
    doc.text(`Total Earnings Paid: ₹${totalEarnings.toLocaleString()}`);
    doc.text(`Total Advances Given: ₹${totalAdvances.toLocaleString()}`);
    doc.moveDown(2);

    // Approved Work Requests
    doc.fontSize(14).fillColor('#333').text('Approved Work Requests', { underline: true });
    doc.moveDown(0.5);

    if (approvedRequests.length === 0) {
        doc.fontSize(10).fillColor('#999').text('No approved requests in this period');
    } else {
        doc.fontSize(9);
        // Table header
        const tableTop = doc.y;
        doc.fillColor('#667eea');
        doc.text('Date', 50, tableTop, { width: 70 });
        doc.text('Worker', 120, tableTop, { width: 100 });
        doc.text('Dealer', 220, tableTop, { width: 80 });
        doc.text('Type', 300, tableTop, { width: 80 });
        doc.text('Count', 380, tableTop, { width: 50 });
        doc.text('Price', 430, tableTop, { width: 60 });
        doc.text('Total', 490, tableTop, { width: 60 });

        doc.moveDown();
        doc.strokeColor('#ddd').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        // Table rows
        doc.fillColor('#333');
        approvedRequests.forEach((req, index) => {
            const y = doc.y;

            // Check if we need a new page
            if (y > 700) {
                doc.addPage();
                doc.fontSize(9).fillColor('#333');
            }

            doc.text(new Date(req.approvalDate).toLocaleDateString(), 50, doc.y, { width: 70 });
            doc.text(req.worker?.name || 'N/A', 120, y, { width: 100 });
            doc.text(req.dealer?.name || 'N/A', 220, y, { width: 80 });
            doc.text(req.diamondType?.name || 'N/A', 300, y, { width: 80 });
            doc.text(req.diamondCount.toString(), 380, y, { width: 50 });
            doc.text(`₹${req.assignedPrice}`, 430, y, { width: 60 });
            doc.text(`₹${req.totalEarning.toLocaleString()}`, 490, y, { width: 60 });

            doc.moveDown();
        });
    }

    doc.moveDown(2);

    // Advances
    doc.fontSize(14).fillColor('#333').text('Advances Given', { underline: true });
    doc.moveDown(0.5);

    if (advances.length === 0) {
        doc.fontSize(10).fillColor('#999').text('No advances in this period');
    } else {
        doc.fontSize(9);
        // Table header
        const tableTop = doc.y;
        doc.fillColor('#667eea');
        doc.text('Date', 50, tableTop, { width: 100 });
        doc.text('Worker', 150, tableTop, { width: 150 });
        doc.text('Amount', 300, tableTop, { width: 100 });
        doc.text('Given By', 400, tableTop, { width: 150 });

        doc.moveDown();
        doc.strokeColor('#ddd').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        // Table rows
        doc.fillColor('#333');
        advances.forEach(adv => {
            const y = doc.y;

            // Check if we need a new page
            if (y > 700) {
                doc.addPage();
                doc.fontSize(9).fillColor('#333');
            }

            doc.text(new Date(adv.date).toLocaleDateString(), 50, y, { width: 100 });
            doc.text(adv.worker?.name || 'N/A', 150, y, { width: 150 });
            doc.text(`₹${adv.amount.toLocaleString()}`, 300, y, { width: 100 });
            doc.text(adv.manager?.name || 'N/A', 400, y, { width: 150 });

            doc.moveDown();
        });
    }

    // Footer
    doc.fontSize(8).fillColor('#999');
    doc.text('Radhe 4P Diamond Management System', 50, 750, { align: 'center' });

    doc.end();

    return new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
    });
}

// Generate Worker PDF Report
async function generateWorkerPDF(workerId, startDate = null, endDate = null) {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));

    // Get worker info
    const worker = await User.findById(workerId).select('name email');
    if (!worker) {
        throw new Error('Worker not found');
    }

    // Build query
    let query = { worker: workerId };
    if (startDate || endDate) {
        query.approvalDate = {};
        if (startDate) query.approvalDate.$gte = startDate;
        if (endDate) query.approvalDate.$lte = endDate;
    }

    // Fetch data
    const earnings = await WorkRequest.find({ ...query, status: 'approved' })
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
    })
        .populate('manager', 'name')
        .sort({ date: -1 });

    // Header
    doc.fontSize(20).fillColor('#667eea').text('Radhe 4P Management System', { align: 'center' });
    doc.fontSize(16).fillColor('#333').text('Worker Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).fillColor('#666').text(`Worker: ${worker.name}`, { align: 'center' });
    doc.fontSize(10).text(worker.email, { align: 'center' });
    doc.moveDown();

    if (startDate || endDate) {
        doc.fontSize(10).fillColor('#666');
        if (startDate) doc.text(`From: ${startDate.toLocaleDateString()}`, { continued: true }).text(`  `, { continued: true });
        if (endDate) doc.text(`To: ${endDate.toLocaleDateString()}`);
        doc.moveDown();
    }

    doc.fontSize(10).fillColor('#999').text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.moveDown(2);

    // Summary
    const totalEarnings = earnings.reduce((sum, e) => sum + (e.totalEarning || 0), 0);
    const totalAdvances = advances.reduce((sum, a) => sum + a.amount, 0);
    const netAmount = totalEarnings - totalAdvances;

    doc.fontSize(14).fillColor('#333').text('Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Total Earnings: ₹${totalEarnings.toLocaleString()}`);
    doc.text(`Total Advances: ₹${totalAdvances.toLocaleString()}`);
    doc.text(`Net Amount: ₹${netAmount.toLocaleString()}`, { fillColor: netAmount >= 0 ? '#059669' : '#dc2626' });
    doc.moveDown(2);

    // Earnings
    doc.fontSize(14).fillColor('#333').text('Earnings', { underline: true });
    doc.moveDown(0.5);

    if (earnings.length === 0) {
        doc.fontSize(10).fillColor('#999').text('No earnings in this period');
    } else {
        doc.fontSize(9);
        // Table header
        const tableTop = doc.y;
        doc.fillColor('#667eea');
        doc.text('Date', 50, tableTop, { width: 80 });
        doc.text('Dealer', 130, tableTop, { width: 100 });
        doc.text('Type', 230, tableTop, { width: 100 });
        doc.text('Count', 330, tableTop, { width: 60 });
        doc.text('Price', 390, tableTop, { width: 70 });
        doc.text('Total', 460, tableTop, { width: 90 });

        doc.moveDown();
        doc.strokeColor('#ddd').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        // Table rows
        doc.fillColor('#333');
        earnings.forEach(earning => {
            const y = doc.y;

            if (y > 700) {
                doc.addPage();
                doc.fontSize(9).fillColor('#333');
            }

            doc.text(new Date(earning.approvalDate).toLocaleDateString(), 50, y, { width: 80 });
            doc.text(earning.dealer?.name || 'N/A', 130, y, { width: 100 });
            doc.text(earning.diamondType?.name || 'N/A', 230, y, { width: 100 });
            doc.text(earning.diamondCount.toString(), 330, y, { width: 60 });
            doc.text(`₹${earning.assignedPrice}`, 390, y, { width: 70 });
            doc.text(`₹${earning.totalEarning.toLocaleString()}`, 460, y, { width: 90 });

            doc.moveDown();
        });
    }

    doc.moveDown(2);

    // Advances
    doc.fontSize(14).fillColor('#333').text('Advances Received', { underline: true });
    doc.moveDown(0.5);

    if (advances.length === 0) {
        doc.fontSize(10).fillColor('#999').text('No advances in this period');
    } else {
        doc.fontSize(9);
        // Table header
        const tableTop = doc.y;
        doc.fillColor('#667eea');
        doc.text('Date', 50, tableTop, { width: 120 });
        doc.text('Amount', 170, tableTop, { width: 120 });
        doc.text('Given By', 290, tableTop, { width: 150 });

        doc.moveDown();
        doc.strokeColor('#ddd').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        // Table rows
        doc.fillColor('#333');
        advances.forEach(advance => {
            const y = doc.y;

            if (y > 700) {
                doc.addPage();
                doc.fontSize(9).fillColor('#333');
            }

            doc.text(new Date(advance.date).toLocaleDateString(), 50, y, { width: 120 });
            doc.text(`₹${advance.amount.toLocaleString()}`, 170, y, { width: 120 });
            doc.text(advance.manager?.name || 'N/A', 290, y, { width: 150 });

            doc.moveDown();
        });
    }

    // Footer
    doc.fontSize(8).fillColor('#999');
    doc.text('Radhe 4P Diamond Management System', 50, 750, { align: 'center' });

    doc.end();

    return new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
    });
}

module.exports = {
    generateManagerPDF,
    generateWorkerPDF
};
