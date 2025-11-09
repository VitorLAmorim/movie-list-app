import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
  throw new Error('TMDB_API_KEY não está configurada nas variáveis de ambiente');
}

interface TMDBMovieResponse {
  results: any[];
  page: number;
  total_pages: number;
  total_results: number;
}

interface TMDBMovieDetails {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  poster_path: string | null;
  backdrop_path: string | null;
  genres: Array<{ id: number; name: string }>;
  runtime: number;
  credits?: {
    crew: Array<{ job: string; name: string }>;
    cast: Array<{ name: string }>;
  };
  videos?: {
    results: Array<{ type: string; site: string; key: string }>;
  };
}

interface FormattedMovie {
  id: number;
  title: string;
  originalTitle: string;
  overview: string;
  releaseDate: string;
  rating: number;
  voteCount: number;
  poster: string | null;
  backdrop: string | null;
  genres: Array<{ id: number; name: string }>;
  runtime: number | null;
  director: string | null;
  cast: string[] | null;
  trailer: string | null;
}

class TMDBService {
  async searchMovies(query: string, page: number = 1): Promise<TMDBMovieResponse> {
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
    } catch (error: any) {
      console.error('Erro ao buscar filmes:', error.response?.data || error.message);
      throw new Error('Falha ao buscar filmes na API TMDb');
    }
  }

  async getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'pt-BR',
          append_to_response: 'videos,credits'
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar detalhes do filme:', error.response?.data || error.message);
      throw new Error('Falha ao buscar detalhes do filme na API TMDb');
    }
  }

  async getPopularMovies(page: number = 1): Promise<TMDBMovieResponse> {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'pt-BR',
          page: page
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar filmes populares:', error.response?.data || error.message);
      throw new Error('Falha ao buscar filmes populares na API TMDb');
    }
  }

  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week', page: number = 1): Promise<TMDBMovieResponse> {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/${timeWindow}`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'pt-BR',
          page: page
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar filmes em alta:', error.response?.data || error.message);
      throw new Error('Falha ao buscar filmes em alta na API TMDb');
    }
  }

  getImageUrl(path: string | null | undefined, size: string = 'w500'): string | null {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }

  formatMovieData(movie: TMDBMovieDetails): FormattedMovie {
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
      runtime: movie.runtime || null,
      director: movie.credits?.crew?.find(person => person.job === 'Director')?.name || null,
      cast: movie.credits?.cast?.slice(0, 5).map(actor => actor.name) || null,
      trailer: movie.videos?.results?.find(video => video.type === 'Trailer' && video.site === 'YouTube')?.key || null
    };
  }
}

export default new TMDBService();
export type { FormattedMovie };
