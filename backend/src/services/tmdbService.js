const axios = require('axios');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
  throw new Error('TMDB_API_KEY não está configurada nas variáveis de ambiente');
}

class TMDBService {
  async searchMovies(query, page = 1) {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'pt-BR',
          query: query,
          page: page,
          include_adult: false
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar filmes:', error.response?.data || error.message);
      throw new Error('Falha ao buscar filmes na API TMDb');
    }
  }

  async getMovieDetails(movieId) {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'pt-BR',
          append_to_response: 'videos,credits'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar detalhes do filme:', error.response?.data || error.message);
      throw new Error('Falha ao buscar detalhes do filme na API TMDb');
    }
  }

  async getPopularMovies(page = 1) {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'pt-BR',
          page: page
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar filmes populares:', error.response?.data || error.message);
      throw new Error('Falha ao buscar filmes populares na API TMDb');
    }
  }

  async getTrendingMovies(timeWindow = 'week', page = 1) {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/${timeWindow}`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'pt-BR',
          page: page
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar filmes em alta:', error.response?.data || error.message);
      throw new Error('Falha ao buscar filmes em alta na API TMDb');
    }
  }

  getImageUrl(path, size = 'w500') {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }

  formatMovieData(movie) {
    return {
      id: movie.id,
      title: movie.title,
      originalTitle: movie.original_title,
      overview: movie.overview,
      releaseDate: movie.release_date,
      rating: movie.vote_average,
      voteCount: movie.vote_count,
      poster: this.getImageUrl(movie.poster_path),
      backdrop: this.getImageUrl(movie.backdrop_path, 'w1280'),
      genres: movie.genres || [],
      runtime: movie.runtime,
      director: movie.credits?.crew?.find(person => person.job === 'Director')?.name,
      cast: movie.credits?.cast?.slice(0, 5).map(actor => actor.name),
      trailer: movie.videos?.results?.find(video => video.type === 'Trailer' && video.site === 'YouTube')?.key
    };
  }
}

module.exports = new TMDBService();