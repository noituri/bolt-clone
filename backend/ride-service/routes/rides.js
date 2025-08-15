const express = require('express');
const router = express.Router();
const ridesController = require('../controllers/ridesController');
const auth = require('../middleware/auth');

router.post('/request', auth, ridesController.requestRide);
router.get('/route-info', auth, ridesController.routeInfo);
router.get('/history', auth, ridesController.rideHistory);
router.get('/available', auth, ridesController.availableRides);
router.get('/assigned', auth, ridesController.assignedRides);
router.get('/:id', auth, ridesController.getRide);
router.put('/cancel/:id', auth, ridesController.cancelRide);
router.post('/accept/:id', auth, ridesController.acceptRide);
router.post('/reject/:id', auth, ridesController.rejectRide);

module.exports = router;
