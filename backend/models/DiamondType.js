const mongoose = require('mongoose');

const diamondTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Diamond type name is required'],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        trim: true
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DiamondType', diamondTypeSchema);
