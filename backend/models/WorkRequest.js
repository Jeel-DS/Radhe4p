const mongoose = require('mongoose');

const workRequestSchema = new mongoose.Schema({
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dealer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dealer',
        required: true
    },
    diamondType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DiamondType',
        required: true
    },
    diamondCount: {
        type: Number,
        required: [true, 'Diamond count is required'],
        min: 1
    },
    requestDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    assignedPrice: {
        type: Number,
        min: 0
    },
    totalEarning: {
        type: Number,
        min: 0
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvalDate: {
        type: Date
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Calculate total earning before saving if approved
workRequestSchema.pre('save', function (next) {
    if (this.status === 'approved' && this.assignedPrice && this.diamondCount) {
        this.totalEarning = this.assignedPrice * this.diamondCount;
    }
    next();
});

module.exports = mongoose.model('WorkRequest', workRequestSchema);
