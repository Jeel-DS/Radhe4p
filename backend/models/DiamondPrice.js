const mongoose = require('mongoose');

const diamondPriceSchema = new mongoose.Schema({
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
    pricePerDiamond: {
        type: Number,
        required: [true, 'Price per diamond is required'],
        min: 0
    }
}, {
    timestamps: true
});

// Ensure unique combination of dealer and diamond type
diamondPriceSchema.index({ dealer: 1, diamondType: 1 }, { unique: true });

module.exports = mongoose.model('DiamondPrice', diamondPriceSchema);
