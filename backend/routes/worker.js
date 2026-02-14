const express = require('express');
const WorkRequest = require('../models/WorkRequest');
const Advance = require('../models/Advance');
const Dealer = require('../models/Dealer');
const DiamondType = require('../models/DiamondType');
const User = require('../models/User');
const { authenticate, authorizeRole } = require('../middleware/auth');
const { generateWorkerPDF } = require('../utils/pdfGenerator');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(authorizeRole('worker'));

// Submit work request
router.post('/work-request', async (req, res) => {
    try {
        const { dealer, diamondType, diamondCount } = req.body;

        if (!dealer || !diamondType || !diamondCount) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const workRequest = new WorkRequest({
            worker: req.user._id,
            dealer,
            diamondType,
            diamondCount,
            status: 'pending'
        });

        await workRequest.save();

        const populatedRequest = await WorkRequest.findById(workRequest._id)
            .populate('dealer', 'name')
            .populate('diamondType', 'name');

        res.status(201).json({
            success: true,
            message: 'Work request submitted successfully',
            workRequest: populatedRequest
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get worker earnings (approved requests)
router.get('/earnings', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let query = {
            worker: req.user._id,
            status: 'approved'
        };

        if (startDate || endDate) {
            query.approvalDate = {};
            if (startDate) query.approvalDate.$gte = new Date(startDate);
            if (endDate) query.approvalDate.$lte = new Date(endDate);
        }

        const earnings = await WorkRequest.find(query)
            .populate('dealer', 'name')
            .populate('diamondType', 'name')
            .populate('approvedBy', 'name')
            .sort({ approvalDate: -1 });

        const totalEarnings = earnings.reduce((sum, req) => sum + (req.totalEarning || 0), 0);

        res.json({
            success: true,
            earnings,
            totalEarnings
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get worker advances
router.get('/advances', async (req, res) => {
    try {
        const advances = await Advance.find({ worker: req.user._id })
            .populate('manager', 'name')
            .sort({ date: -1 });

        const totalAdvances = advances.reduce((sum, adv) => sum + adv.amount, 0);

        res.json({
            success: true,
            advances,
            totalAdvances
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get dealers
router.get('/dealers', async (req, res) => {
    try {
        const dealers = await Dealer.find({ active: true }).select('name');
        res.json({ success: true, dealers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get diamond types
router.get('/diamond-types', async (req, res) => {
    try {
        const diamondTypes = await DiamondType.find({ active: true }).select('name');
        res.json({ success: true, diamondTypes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Download report
router.get('/report', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const buffer = await generateWorkerPDF(
            req.user._id,
            startDate ? new Date(startDate) : null,
            endDate ? new Date(endDate) : null
        );

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=worker-report-${Date.now()}.pdf`);
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get Employee of the Week
router.get('/employee-of-week', async (req, res) => {
    try {
        const employeeOfWeek = await User.findOne({
            role: 'worker',
            isEmployeeOfWeek: true
        }).select('name email');

        res.json({
            success: true,
            employeeOfWeek: employeeOfWeek || null
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
