const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/paymentsController');
const auth = require('../middleware/auth');

router.post('/', auth, paymentsController.createPayment);
router.get('/:id', auth, paymentsController.getPayment);
router.put('/:id', auth, paymentsController.updatePayment);
router.get('/', auth, paymentsController.listPayments);

router.get('/by-ride/:rideId', auth, paymentsController.getPaymentByRideId);
router.put('/by-ride/:rideId', auth, paymentsController.updatePaymentByRideId);

module.exports = router;
