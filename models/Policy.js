const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
    clientName: { type: String, required: true, trim: true },
    startDate: { type: Date, default: null },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date, default: null },
    remindersSent: [{
        stage: { type: String, enum: ['one-month', '15-days', '2-days'] },
        sentAt: { type: Date, default: Date.now },
    }],
}, { timestamps: true });

module.exports = mongoose.model('Policy', policySchema);
