const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuthMiddleware = require('../middleware/adminAuth');

router.get('/users', adminAuthMiddleware, adminController.getAllUsers);
router.get('/users/:id', adminAuthMiddleware, adminController.getUserById);
router.post('/users/add', adminAuthMiddleware, adminController.addUser);
router.put('/users/modify/:id', adminAuthMiddleware, adminController.modifyUser);
router.delete('/users/delete/:id', adminAuthMiddleware, adminController.deleteUser);

module.exports = router;