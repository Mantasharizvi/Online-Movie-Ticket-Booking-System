const express = require('express');
const router = express.Router();
const cinemaController = require('../controllers/cinemaController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/', cinemaController.getCinemas);
router.get('/:name', cinemaController.getCinemaDetails);

module.exports = router;
