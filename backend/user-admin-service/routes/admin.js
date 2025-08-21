const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuthMiddleware = require('../middleware/adminAuth');

router.get('/users', adminAuthMiddleware, adminController.getAllUsers);
router.post('/users', adminAuthMiddleware, adminController.addUser);
router.get('/users/:id', adminAuthMiddleware, adminController.getUserById);
router.put('/users/:id', adminAuthMiddleware, adminController.modifyUser);
router.delete('/users/:id', adminAuthMiddleware, adminController.deleteUser);
router.put("/users/:id/change-password", adminAuthMiddleware, adminController.changeUserPassword);

module.exports = router;
