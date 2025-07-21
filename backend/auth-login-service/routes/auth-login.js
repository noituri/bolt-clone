const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth-login-controller');
const auth = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.put('/users/change-password', auth, authController.changePassword);

module.exports = router;