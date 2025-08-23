const Payments = require('../../db-schema/models/Payments');
const { validatePaymentData } = require('../helpers/validation');

function applyPaymentPatch(payment, body = {}) {
    if (Object.prototype.hasOwnProperty.call(body, 'status')) {
        payment.status = body.status;

        if (body.status === 'paid') {
            payment.paid_at = new Date();
        } else if (body.status === 'refunded' || body.status === 'canceled' || body.status === 'failed' || body.status === 'pending') {
            payment.paid_at = null;
        }
    }

    if (Object.prototype.hasOwnProperty.call(body, 'driver_id')) {
        payment.driver_id = body.driver_id;
    }

    if (Object.prototype.hasOwnProperty.call(body, 'method')) {
        payment.method = body.method;
    }

    if (Object.prototype.hasOwnProperty.call(body, 'amount')) {
        payment.amount = body.amount;
    }
}

module.exports = {
    // POST /payments
    createPayment: async (req, res) => {
        const err = validatePaymentData(req.body);
        if (err) return res.status(400).json({ error: err });

        try {
            const payment = await Payments.create({
                ride_id: req.body.ride_id,
                client_id: req.body.client_id,
                driver_id: req.body.driver_id || null,
                amount: req.body.amount,
                method: req.body.method,
                status: req.body.status || 'pending',
                created_at: new Date(),
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

    // GET /payments/:id
    getPayment: async (req, res) => {
        try {
            const payment = await Payments.findByPk(req.params.id);
            if (!payment) return res.status(404).json({ error: 'Payment not found' });
            res.json(payment);
        } catch (e) {
            res.status(500).json({ error: 'Server error' });
        }
    },

    // GET /payments/by-ride/:rideId
    getPaymentByRideId: async (req, res) => {
        try {
            const payment = await Payments.findOne({ where: { ride_id: req.params.rideId } });
            if (!payment) return res.status(404).json({ error: 'Payment not found for this ride' });
            res.json(payment);
        } catch (e) {
            res.status(500).json({ error: 'Server error' });
        }
    },

    // PUT /payments/:id
    updatePayment: async (req, res) => {
        try {
            const payment = await Payments.findByPk(req.params.id);
            if (!payment) return res.status(404).json({ error: 'Payment not found' });

            applyPaymentPatch(payment, req.body);
            await payment.save();

            res.json(payment);
        } catch (e) {
            res.status(500).json({ error: 'Server error', details: e.message });
        }
    },

    // PUT /payments/by-ride/:rideId 
    updatePaymentByRideId: async (req, res) => {
        try {
            const payment = await Payments.findOne({ where: { ride_id: req.params.rideId } });
            if (!payment) return res.status(404).json({ error: 'Payment not found for this ride' });

            applyPaymentPatch(payment, req.body);
            await payment.save();

            res.json(payment);
        } catch (e) {
            res.status(500).json({ error: 'Server error', details: e.message });
        }
    },

    // GET /payments?ride_id=&client_id=&driver_id=
    listPayments: async (req, res) => {
        try {
            const where = {};
            if (req.query.ride_id) where.ride_id = req.query.ride_id;
            if (req.query.client_id) where.client_id = req.query.client_id;
            if (req.query.driver_id) where.driver_id = req.query.driver_id;

            const payments = await Payments.findAll({ where });
            res.json(payments);
        } catch (e) {
            res.status(500).json({ error: 'Server error' });
        }
    }
};
