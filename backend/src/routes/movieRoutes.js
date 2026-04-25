const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/', movieController.getAllMovies);
router.get('/upcoming', movieController.getUpcomingMovies);
router.get('/search', movieController.searchMovies);
router.get('/:id', movieController.getMovieById);

// Admin only routes
router.post('/', authMiddleware, adminMiddleware, movieController.createMovie);
router.put('/:id', authMiddleware, adminMiddleware, movieController.updateMovie);
router.delete('/:id', authMiddleware, adminMiddleware, movieController.deleteMovie);

module.exports = router;
