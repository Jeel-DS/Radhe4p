const mongoose = require('mongoose');

const dealerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Dealer name is required'],
        trim: true
    },
    contactInfo: {
        type: String,
        trim: true
    },
    active: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Dealer', dealerSchema);
