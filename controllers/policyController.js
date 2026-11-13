const Policy = require('../models/Policy');
const xlsx = require('xlsx');

const policyFields = ({ clientName, startDate, dueDate, paidDate }) => ({
    clientName,
    startDate: startDate || null,
    dueDate,
    paidDate: paidDate || null,
});

const datesAreValid = ({ startDate, dueDate, paidDate }) => {
    if (!dueDate || Number.isNaN(new Date(dueDate).getTime())) return false;
    if (startDate && new Date(dueDate) < new Date(startDate)) return false;
    return !paidDate || !Number.isNaN(new Date(paidDate).getTime());
};

exports.createPolicy = async (req, res) => {
    try {
        const data = policyFields(req.body);
        if (!datesAreValid(data)) {
            return res.status(400).json({ error: 'Enter a valid due date. It cannot be before the start date.' });
        }
        const policy = await Policy.create(data);
        res.status(201).json({ message: 'Record created successfully', policy });
    } catch (error) {
        console.error('Error creating record:', error);
        res.status(400).json({ error: error.message || 'Error creating record' });
    }
};

exports.getPolicies = async (_req, res) => {
    try {
        res.json(await Policy.find().sort({ dueDate: 1 }));
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).json({ error: error.message || 'Error fetching records' });
    }
};

exports.updatePolicy = async (req, res) => {
    try {
        const data = policyFields(req.body);
        if (!datesAreValid(data)) {
            return res.status(400).json({ error: 'Enter a valid due date. It cannot be before the start date.' });
        }
        const existing = await Policy.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: 'Record not found' });
        if (new Date(existing.dueDate).getTime() !== new Date(data.dueDate).getTime()) {
            data.remindersSent = [];
        }
        const updatedPolicy = await Policy.findByIdAndUpdate(req.params.id, data, {
            new: true,
            runValidators: true,
        });
        res.json(updatedPolicy);
    } catch (error) {
        res.status(400).json({ error: error.message || 'Error updating record' });
    }
};

exports.deletePolicy = async (req, res) => {
    try {
        const deleted = await Policy.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Record not found' });
        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting record' });
    }
};

exports.exportPolicies = async (_req, res) => {
    try {
        const policies = await Policy.find().sort({ dueDate: 1 });
        const rows = policies.map((policy) => ({
            'Client Name': policy.clientName,
            'Start Date': policy.startDate?.toLocaleDateString() || '',
            'Due Date': policy.dueDate?.toLocaleDateString() || '',
            'Paid Date': policy.paidDate?.toLocaleDateString() || '',
        }));
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet(rows), 'Records');
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Disposition', 'attachment; filename=records.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        res.status(500).send('Error generating Excel file');
    }
};
