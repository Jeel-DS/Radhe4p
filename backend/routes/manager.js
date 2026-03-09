const express = require('express');
const WorkRequest = require('../models/WorkRequest');
const Dealer = require('../models/Dealer');
const DiamondType = require('../models/DiamondType');
const DiamondPrice = require('../models/DiamondPrice');
const Advance = require('../models/Advance');
const User = require('../models/User');
const DealerTransaction = require('../models/DealerTransaction');
const { authenticate, authorizeRole } = require('../middleware/auth');
const { generateManagerPDF } = require('../utils/pdfGenerator');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(authorizeRole('manager'));

// Get pending work requests
router.get('/pending-requests', async (req, res) => {
    try {
        const pendingRequests = await WorkRequest.find({ status: 'pending' })
            .populate('worker', 'name email')
            .populate('dealer', 'name')
            .populate('diamondType', 'name')
            .sort({ requestDate: -1 });

        res.json({ success: true, requests: pendingRequests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Approve or reject work request
router.put('/approve-request/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, assignedPrice, notes } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const workRequest = await WorkRequest.findById(id);
        if (!workRequest) {
            return res.status(404).json({
                success: false,
                message: 'Work request not found'
            });
        }

        if (workRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'This request has already been processed'
            });
        }

        workRequest.status = status;
        workRequest.approvedBy = req.user._id;
        workRequest.approvalDate = new Date();

        if (status === 'approved') {
            if (!assignedPrice || assignedPrice <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid price is required for approval'
                });
            }
            workRequest.assignedPrice = assignedPrice;
        }

        if (notes) {
            workRequest.notes = notes;
        }

        await workRequest.save();

        const updatedRequest = await WorkRequest.findById(id)
            .populate('worker', 'name email')
            .populate('dealer', 'name')
            .populate('diamondType', 'name')
            .populate('approvedBy', 'name');

        res.json({
            success: true,
            message: `Work request ${status} successfully`,
            workRequest: updatedRequest
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all dealers
router.get('/dealers', async (req, res) => {
    try {
        const dealers = await Dealer.find()
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, dealers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create dealer
router.post('/dealers', async (req, res) => {
    try {
        const { name, contactInfo } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Dealer name is required'
            });
        }

        const dealer = new Dealer({
            name,
            contactInfo,
            createdBy: req.user._id
        });

        await dealer.save();

        const populatedDealer = await Dealer.findById(dealer._id)
            .populate('createdBy', 'name');

        res.status(201).json({
            success: true,
            message: 'Dealer created successfully',
            dealer: populatedDealer
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update dealer
router.put('/dealers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, contactInfo, active } = req.body;

        const dealer = await Dealer.findByIdAndUpdate(
            id,
            { name, contactInfo, active },
            { new: true, runValidators: true }
        ).populate('createdBy', 'name');

        if (!dealer) {
            return res.status(404).json({
                success: false,
                message: 'Dealer not found'
            });
        }

        res.json({
            success: true,
            message: 'Dealer updated successfully',
            dealer
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all diamond types
router.get('/diamond-types', async (req, res) => {
    try {
        const diamondTypes = await DiamondType.find().sort({ createdAt: -1 });
        res.json({ success: true, diamondTypes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create diamond type
router.post('/diamond-types', async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Diamond type name is required'
            });
        }

        const diamondType = new DiamondType({ name, description });
        await diamondType.save();

        res.status(201).json({
            success: true,
            message: 'Diamond type created successfully',
            diamondType
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update diamond type
router.put('/diamond-types/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, active } = req.body;

        const diamondType = await DiamondType.findByIdAndUpdate(
            id,
            { name, description, active },
            { new: true, runValidators: true }
        );

        if (!diamondType) {
            return res.status(404).json({
                success: false,
                message: 'Diamond type not found'
            });
        }

        res.json({
            success: true,
            message: 'Diamond type updated successfully',
            diamondType
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all prices
router.get('/prices', async (req, res) => {
    try {
        const prices = await DiamondPrice.find()
            .populate('dealer', 'name')
            .populate('diamondType', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, prices });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create or update price
router.post('/prices', async (req, res) => {
    try {
        const { dealer, diamondType, pricePerDiamond } = req.body;

        if (!dealer || !diamondType || pricePerDiamond == null) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if price already exists for this combination
        let price = await DiamondPrice.findOne({ dealer, diamondType });

        if (price) {
            // Update existing price
            price.pricePerDiamond = pricePerDiamond;
            await price.save();
        } else {
            // Create new price
            price = new DiamondPrice({ dealer, diamondType, pricePerDiamond });
            await price.save();
        }

        const populatedPrice = await DiamondPrice.findById(price._id)
            .populate('dealer', 'name')
            .populate('diamondType', 'name');

        res.status(201).json({
            success: true,
            message: 'Price saved successfully',
            price: populatedPrice
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update price
router.put('/prices/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { pricePerDiamond } = req.body;

        const price = await DiamondPrice.findByIdAndUpdate(
            id,
            { pricePerDiamond },
            { new: true, runValidators: true }
        ).populate('dealer', 'name').populate('diamondType', 'name');

        if (!price) {
            return res.status(404).json({
                success: false,
                message: 'Price not found'
            });
        }

        res.json({
            success: true,
            message: 'Price updated successfully',
            price
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Give advance to worker
router.post('/advances', async (req, res) => {
    try {
        const { worker, amount, notes } = req.body;

        if (!worker || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Worker and amount are required'
            });
        }

        const advance = new Advance({
            worker,
            manager: req.user._id,
            amount,
            notes
        });

        await advance.save();

        const populatedAdvance = await Advance.findById(advance._id)
            .populate('worker', 'name email')
            .populate('manager', 'name');

        res.status(201).json({
            success: true,
            message: 'Advance given successfully',
            advance: populatedAdvance
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all workers
router.get('/workers', async (req, res) => {
    try {
        const workers = await User.find({ role: 'worker' }).select('name email isEmployeeOfWeek');
        res.json({ success: true, workers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get analytics
router.get('/analytics', async (req, res) => {
    try {
        const totalWorkers = await User.countDocuments({ role: 'worker' });
        const pendingRequests = await WorkRequest.countDocuments({ status: 'pending' });

        const approvedRequests = await WorkRequest.find({ status: 'approved' });
        const totalEarnings = approvedRequests.reduce((sum, req) => sum + (req.totalEarning || 0), 0);

        const totalAdvances = await Advance.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        res.json({
            success: true,
            analytics: {
                totalWorkers,
                pendingRequests,
                totalEarnings,
                totalAdvances: totalAdvances.length > 0 ? totalAdvances[0].total : 0,
                approvedRequestsCount: approvedRequests.length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Download report
router.get('/report', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const buffer = await generateManagerPDF(
            startDate ? new Date(startDate) : null,
            endDate ? new Date(endDate) : null
        );

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=manager-report-${Date.now()}.pdf`);
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Set Employee of the Week
router.post('/employee-of-week', async (req, res) => {
    try {
        const { workerId } = req.body;

        if (!workerId) {
            return res.status(400).json({
                success: false,
                message: 'Worker ID is required'
            });
        }

        // First, remove employee of the week status from all workers
        await User.updateMany(
            { role: 'worker', isEmployeeOfWeek: true },
            { isEmployeeOfWeek: false }
        );

        // Set the new employee of the week
        const worker = await User.findByIdAndUpdate(
            workerId,
            { isEmployeeOfWeek: true },
            { new: true }
        ).select('name email isEmployeeOfWeek');

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: 'Worker not found'
            });
        }

        res.json({
            success: true,
            message: `${worker.name} is now Employee of the Week!`,
            worker
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Remove Employee of the Week status
router.delete('/employee-of-week/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const worker = await User.findByIdAndUpdate(
            id,
            { isEmployeeOfWeek: false },
            { new: true }
        ).select('name email isEmployeeOfWeek');

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: 'Worker not found'
            });
        }

        res.json({
            success: true,
            message: 'Employee of the Week status removed',
            worker
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all advances with worker details
router.get('/advances', async (req, res) => {
    try {
        const advances = await Advance.find()
            .populate('worker', 'name email')
            .sort({ date: -1 });
        res.json({ success: true, advances });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create Dealer Transaction
router.post('/dealer-transactions', async (req, res) => {
    try {
        const { dealer, diamondType, count, pricePerDiamond, date } = req.body;
        const transaction = new DealerTransaction({
            dealer,
            diamondType,
            count,
            pricePerDiamond,
            date: date || Date.now()
        });
        await transaction.save();
        res.status(201).json({ success: true, message: 'Transaction recorded successfully', transaction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get Dealer Transactions
router.get('/dealer-transactions', async (req, res) => {
    try {
        const transactions = await DealerTransaction.find()
            .populate('dealer', 'name')
            .populate('diamondType', 'name')
            .sort({ date: -1 });
        res.json({ success: true, transactions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get Profit Analytics
router.get('/profit', async (req, res) => {
    try {
        const transactions = await DealerTransaction.find();
        const totalRevenue = transactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);

        const workRequests = await WorkRequest.find({ status: 'approved' });
        const totalLaborCost = workRequests.reduce((sum, w) => sum + (w.totalEarning || 0), 0);

        const netProfit = totalRevenue - totalLaborCost;

        res.json({
            success: true,
            profit: {
                totalRevenue,
                totalLaborCost,
                netProfit
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get data for Worker PDF Report
router.get('/worker-report/:id', async (req, res) => {
    try {
        const workerId = req.params.id;

        // Verify worker exists
        const worker = await User.findOne({ _id: workerId, role: 'worker' });
        if (!worker) {
            return res.status(404).json({ success: false, message: 'Worker not found' });
        }

        // Fetch completed (approved) work requests for the worker
        const workRequests = await WorkRequest.find({
            worker: workerId,
            status: 'approved'
        }).populate('dealer', 'name').sort({ approvalDate: -1 });

        // Map them to the structured workLogs expected by the frontend
        const workLogs = workRequests.map(req => ({
            _id: req._id,
            date: req.approvalDate || req.requestDate,
            diamonds: req.diamondCount,
            price: req.assignedPrice || 0,
            dealerName: req.dealer ? req.dealer.name : 'Unknown Dealer'
        }));

        // Fetch advances
        const advances = await Advance.find({ worker: workerId }).sort({ date: -1 });

        res.json({
            success: true,
            worker: { name: worker.name, email: worker.email },
            workLogs,
            advances
        });

    } catch (error) {
        console.error('Error fetching worker report:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
