const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

// Rota para buscar filmes
router.get('/search', movieController.searchMovies);

// Rota para obter detalhes de um filme específico
router.get('/:id', movieController.getMovieDetails);

// Rota para obter filmes populares
router.get('/popular/list', movieController.getPopularMovies);

// Rota para obter filmes em alta
router.get('/trending/list', movieController.getTrendingMovies);

module.exports = router;