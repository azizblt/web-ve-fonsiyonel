const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['LOGIN', 'LOGOUT', 'STOCK_IN', 'STOCK_OUT', 'PRODUCT_ADD', 'PRODUCT_UPDATE', 'PRODUCT_DELETE']
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    ip: String,
    userAgent: String
});

module.exports = mongoose.model('Log', logSchema); 