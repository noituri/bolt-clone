const Payments = require('../../db-schema/models/Payments');
const { validatePaymentData } = require('../helpers/validation');

module.exports = {
    // Add a new payment
    createPayment: async (req, res) => {
        const err = validatePaymentData(req.body);
        if (err) return res.status(400).json({ error: err });

        try {
            const payment = await Payments.create({
                ride_id: req.body.ride_id,
                client_id: req.body.client_id,
                amount: req.body.amount,
                method: req.body.method,
                status: req.body.status || 'pending',
                created_at: new Date(),
                reference: req.body.reference || null,
                paid_at: req.body.status === 'paid' ? new Date() : null
            });
            res.status(201).json(payment);
        } catch (e) {
            if (e.name === 'SequelizeUniqueConstraintError') {
                res.status(409).json({ error: 'Duplicate payment' });
            } else {
                res.status(500).json({ error: 'Server error', details: e.message });
            }
        }
    },

    // Get payment details
    getPayment: async (req, res) => {
        try {
            const payment = await Payments.findByPk(req.params.id);
            if (!payment) return res.status(404).json({ error: 'Payment not found' });
            res.json(payment);
        } catch (e) {
            res.status(500).json({ error: 'Server error' });
        }
    },

    // Update payment status (e.g. mark as paid, refund)
    updatePayment: async (req, res) => {
        try {
            const payment = await Payments.findByPk(req.params.id);
            if (!payment) return res.status(404).json({ error: 'Payment not found' });

            if (req.body.status) {
                payment.status = req.body.status;
                if (req.body.status === 'paid') payment.paid_at = new Date();
                if (req.body.status === 'refunded') payment.paid_at = null;
            }
            await payment.save();
            res.json(payment);
        } catch (e) {
            res.status(500).json({ error: 'Server error' });
        }
    },

    // List payments by ride_id or client_id
    listPayments: async (req, res) => {
        try {
            const where = {};
            if (req.query.ride_id) where.ride_id = req.query.ride_id;
            if (req.query.client_id) where.client_id = req.query.client_id;

            const payments = await Payments.findAll({ where });
            res.json(payments);
        } catch (e) {
            res.status(500).json({ error: 'Server error' });
        }
    }
};
