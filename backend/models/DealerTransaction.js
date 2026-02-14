const mongoose = require('mongoose');

const dealerTransactionSchema = new mongoose.Schema({
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
    count: {
        type: Number,
        required: [true, 'Diamond count is required'],
        min: 1
    },
    pricePerDiamond: {
        type: Number,
        required: [true, 'Price per diamond is required'],
        min: 0
    },
    totalAmount: {
        type: Number
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Calculate total amount before saving
dealerTransactionSchema.pre('save', function (next) {
    if (this.count && this.pricePerDiamond) {
        this.totalAmount = this.count * this.pricePerDiamond;
    }
    next();
});

module.exports = mongoose.model('DealerTransaction', dealerTransactionSchema);
