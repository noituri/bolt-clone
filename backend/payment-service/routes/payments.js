const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/paymentsController');
const auth = require('../middleware/auth');

router.post('/', auth, paymentsController.createPayment);
router.get('/:id', auth, paymentsController.getPayment);
router.put('/:id', auth, paymentsController.updatePayment);
router.get('/', auth, paymentsController.listPayments);

module.exports = router;
