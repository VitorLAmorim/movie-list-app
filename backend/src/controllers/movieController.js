const tmdbService = require('../services/tmdbService');

class MovieController {
  async searchMovies(req, res) {
    try {
      const { query, page = 1 } = req.query;

      if (!query) {
        return res.status(400).json({ error: 'Parâmetro "query" é obrigatório' });
      }

      const result = await tmdbService.searchMovies(query, parseInt(page));

      const formattedMovies = result.results.map(movie =>
        tmdbService.formatMovieData(movie)
      );

      res.json({
        movies: formattedMovies,
        currentPage: result.page,
        totalPages: result.total_pages,
        totalResults: result.total_results
      });
    } catch (error) {
      console.error('Erro no controller de busca de filmes:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getMovieDetails(req, res) {
    try {
      const { id } = req.params;
      const movieId = parseInt(id);

      if (!movieId || isNaN(movieId)) {
        return res.status(400).json({ error: 'ID do filme inválido' });
      }

      const movieDetails = await tmdbService.getMovieDetails(movieId);
      const formattedMovie = tmdbService.formatMovieData(movieDetails);

      res.json(formattedMovie);
    } catch (error) {
      console.error('Erro no controller de detalhes do filme:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getPopularMovies(req, res) {
    try {
      const { page = 1 } = req.query;
      const result = await tmdbService.getPopularMovies(parseInt(page));

      const formattedMovies = result.results.map(movie =>
        tmdbService.formatMovieData(movie)
      );

      res.json({
        movies: formattedMovies,
        currentPage: result.page,
        totalPages: result.total_pages,
        totalResults: result.total_results
      });
    } catch (error) {
      console.error('Erro no controller de filmes populares:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getTrendingMovies(req, res) {
    try {
      const { timeWindow = 'week', page = 1 } = req.query;
      const result = await tmdbService.getTrendingMovies(timeWindow, parseInt(page));

      const formattedMovies = result.results.map(movie =>
        tmdbService.formatMovieData(movie)
      );

      res.json({
        movies: formattedMovies,
        currentPage: result.page,
        totalPages: result.total_pages,
        totalResults: result.total_results,
        timeWindow
      });
    } catch (error) {
      console.error('Erro no controller de filmes em alta:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new MovieController();