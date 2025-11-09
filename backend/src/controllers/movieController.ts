import { Request, Response } from 'express';
import tmdbService from '../services/tmdbService';
import { FormattedMovie } from '../services/tmdbService';

interface SearchMoviesQuery {
  query: string;
  page?: string;
}

interface MovieDetailsParams {
  id: string;
}

interface PopularMoviesQuery {
  page?: string;
}

interface TrendingMoviesQuery {
  timeWindow?: string;
  page?: string;
}

interface MovieListResponse {
  movies: FormattedMovie[];
  currentPage: number;
  totalPages: number;
  totalResults: number;
  timeWindow?: string;
}

class MovieController {
  async searchMovies(req: Request<any, any, any, SearchMoviesQuery>, res: Response<MovieListResponse | { error: string }>): Promise<void> {
    try {
      const { query, page = '1' } = req.query;

      if (!query) {
        res.status(400).json({ error: 'Parâmetro "query" é obrigatório' });
        return;
      }

      const result = await tmdbService.searchMovies(query, parseInt(page));

      const formattedMovies = result.results.map(movie =>
        tmdbService.formatMovieData(movie)
      );

      const response: MovieListResponse = {
        movies: formattedMovies,
        currentPage: result.page,
        totalPages: result.total_pages,
        totalResults: result.total_results
      };

      res.json(response);
    } catch (error: any) {
      console.error('Erro no controller de busca de filmes:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getMovieDetails(req: Request<MovieDetailsParams>, res: Response<FormattedMovie | { error: string }>): Promise<void> {
    try {
      const { id } = req.params;
      const movieId = parseInt(id);

      if (!movieId || isNaN(movieId)) {
        res.status(400).json({ error: 'ID do filme inválido' });
        return;
      }

      const movieDetails = await tmdbService.getMovieDetails(movieId);
      const formattedMovie = tmdbService.formatMovieData(movieDetails);

      res.json(formattedMovie);
    } catch (error: any) {
      console.error('Erro no controller de detalhes do filme:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getPopularMovies(req: Request<any, any, any, PopularMoviesQuery>, res: Response<MovieListResponse | { error: string }>): Promise<void> {
    try {
      const { page = '1' } = req.query;
      const result = await tmdbService.getPopularMovies(parseInt(page));

      const formattedMovies = result.results.map(movie =>
        tmdbService.formatMovieData(movie)
      );

      const response: MovieListResponse = {
        movies: formattedMovies,
        currentPage: result.page,
        totalPages: result.total_pages,
        totalResults: result.total_results
      };

      res.json(response);
    } catch (error: any) {
      console.error('Erro no controller de filmes populares:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getTrendingMovies(req: Request<any, any, any, TrendingMoviesQuery>, res: Response<MovieListResponse | { error: string }>): Promise<void> {
    try {
      const { timeWindow = 'week', page = '1' } = req.query;
      const result = await tmdbService.getTrendingMovies(timeWindow as 'day' | 'week', parseInt(page));

      const formattedMovies = result.results.map(movie =>
        tmdbService.formatMovieData(movie)
      );

      const response: MovieListResponse = {
        movies: formattedMovies,
        currentPage: result.page,
        totalPages: result.total_pages,
        totalResults: result.total_results,
        timeWindow
      };

      res.json(response);
    } catch (error: any) {
      console.error('Erro no controller de filmes em alta:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new MovieController();