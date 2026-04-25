const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/stats', authMiddleware, adminMiddleware, adminController.getDashboardStats);
router.get('/users', authMiddleware, adminMiddleware, adminController.getAllUsers);
router.post('/users', authMiddleware, adminMiddleware, adminController.createUser);
router.put('/users/:id', authMiddleware, adminMiddleware, adminController.updateUser);
router.delete('/users/:id', authMiddleware, adminMiddleware, adminController.deleteUser);

module.exports = router;
