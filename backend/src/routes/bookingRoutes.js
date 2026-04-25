const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, bookingController.createBooking);
router.get('/my-bookings', authMiddleware, bookingController.getUserBookings);

// Admin only routes
router.get('/', authMiddleware, adminMiddleware, bookingController.getAllBookings);

module.exports = router;
