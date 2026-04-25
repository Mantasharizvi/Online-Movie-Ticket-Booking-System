const express = require('express');
const router = express.Router();
const showtimeController = require('../controllers/showtimeController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/', showtimeController.getAllShowtimes);
router.get('/movie/:movieId', showtimeController.getShowtimesByMovie);
router.get('/:id', showtimeController.getShowtimeById);

// Admin only routes
router.post('/', authMiddleware, adminMiddleware, showtimeController.createShowtime);

module.exports = router;
