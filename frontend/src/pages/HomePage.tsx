import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiTrendingUp, FiStar, FiFilm } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import MovieModal from '../components/MovieModal';
import LoginModal from '../components/LoginModal';
import { movieAPI, favoritesAPI } from '../services/api';
import { useUser } from '../hooks/useUser';

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>('search');
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [favoriteMovies, setFavoriteMovies] = useState<Set<number>>(new Set());

  const { isLoggedIn, username } = useUser();

  // useEffect para login - usar useCallback para estabilidade
  const handleLoginModal = useCallback(() => {
    const login = searchParams.get('login');
    if (login === 'true' && !isLoggedIn) {
      setShowLoginModal(true);
      // Evitar múltiplas atualizações do searchParams
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('login');
      setSearchParams(newParams);
    }
  }, [searchParams, isLoggedIn, setSearchParams]);

  useEffect(() => {
    handleLoginModal();
  }, [handleLoginModal]);

  // useEffect para favoritos com controle de execução
  useEffect(() => {
    let isMounted = true;

    const loadFavorites = async () => {
      if (!isLoggedIn || !username) {
        if (isMounted) setFavoriteMovies(new Set());
        return;
      }

      try {
        const response = await favoritesAPI.getFavorites(username);
        if (isMounted) {
          const favorites = new Set<number>(response.data.favorites.map((fav: any) => fav.movie_id));
          setFavoriteMovies(favorites);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Erro ao carregar favoritos:', error);
          setFavoriteMovies(new Set());
        }
      }
    };

    loadFavorites();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, username]);

  // useEffect para carregar filmes com controle de execução
  const searchParamsString = searchParams.toString();

  useEffect(() => {
    let isMounted = true;

    const loadMovies = async () => {
      const search = searchParams.get('search');

      if (!isMounted) return;

      setLoading(true);
      setError(null);

      try {
        let response;
        if (search) {
          if (isMounted) setSearchQuery(search);
          if (isMounted) setActiveTab('search');
          response = await movieAPI.searchMovies(search);
        } else {
          response = await movieAPI.getTrendingMovies('week');
        }

        if (isMounted && response) {
          setMovies(response.data.movies);
          setCurrentPage(response.data.currentPage);
          setTotalPages(response.data.totalPages);
        }
      } catch (error) {
        if (isMounted) {
          setError('Erro ao carregar filmes. Tente novamente.');
          console.error('Erro ao carregar filmes:', error);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadMovies();

    return () => {
      isMounted = false;
    };
  }, [searchParams, searchParamsString]); // Usar variável extraída para evitar warnings

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await movieAPI.searchMovies(searchQuery.trim());
      setMovies(response.data.movies);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
      setActiveTab('search');
      setSearchParams({ search: searchQuery.trim() });
    } catch (error) {
      setError('Erro ao buscar filmes. Tente novamente.');
      console.error('Erro ao buscar filmes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = async (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setLoading(true);
    setError(null);

    try {
      let response;
      switch (tab) {
        case 'trending':
          response = await movieAPI.getTrendingMovies('week');
          break;
        case 'popular':
          response = await movieAPI.getPopularMovies();
          break;
        case 'search':
          if (searchQuery.trim()) {
            response = await movieAPI.searchMovies(searchQuery.trim());
          } else {
            response = await movieAPI.getTrendingMovies('week');
          }
          break;
        default:
          response = await movieAPI.getTrendingMovies('week');
      }

      setMovies(response.data.movies);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      setError('Erro ao carregar filmes. Tente novamente.');
      console.error('Erro ao carregar filmes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = async (movie: any) => {
    try {
      const response = await movieAPI.getMovieDetails(movie.id);
      setSelectedMovie(response.data);
    } catch (error) {
      setError('Erro ao carregar detalhes do filme.');
      console.error('Erro ao carregar detalhes:', error);
    }
  };

  const handleFavoriteChange = (movieId: number, isFavorite: boolean) => {
    const newFavorites = new Set(favoriteMovies);
    if (isFavorite) {
      newFavorites.add(movieId);
    } else {
      newFavorites.delete(movieId);
    }
    setFavoriteMovies(newFavorites);
  };

  const handleModalFavoriteChange = (isFavorite: boolean) => {
    if (selectedMovie) {
      handleFavoriteChange(selectedMovie.id, isFavorite);
    }
  };

  const handlePageChange = async (page: number) => {
    if (page < 1 || page > totalPages) return;

    setLoading(true);
    setError(null);

    try {
      let response;
      switch (activeTab) {
        case 'trending':
          response = await movieAPI.getTrendingMovies('week', page);
          break;
        case 'popular':
          response = await movieAPI.getPopularMovies(page);
          break;
        case 'search':
          response = await movieAPI.searchMovies(searchQuery, page);
          break;
        default:
          response = await movieAPI.getTrendingMovies('week', page);
      }

      setMovies(response.data.movies);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      setError('Erro ao carregar filmes. Tente novamente.');
      console.error('Erro ao carregar filmes:', error);
    } finally {
      setLoading(false);
    }
  };

  const isMovieFavorite = (movieId: number): boolean => {
    return favoriteMovies.has(movieId);
  };

  return (
    <div className="max-w-7xl mx-auto w-full sm:px-4 sm:max-w-full">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-surface to-background px-6 py-8 text-center rounded-large mb-8 -mx-6 sm:-mx-4 sm:py-6">
        <h1 className="text-5xl font-bold text-gradient mb-4 sm:text-4xl sm:mb-2 text-3xl sm:mb-2">
          Bem-vindo ao MovieList
        </h1>
        <p className="text-xl text-textSecondary mb-8 sm:text-lg sm:mb-6 text-base sm:mb-4">
          Descubra, organize e compartilhe seus filmes favoritos
        </p>

        {/* Search Container */}
        <div className="max-w-lg mx-auto mb-8 relative sm:max-w-md sm:mb-6">
          <form onSubmit={handleSearch} className="flex gap-2 flex-col sm:flex-row">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar filmes..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pl-12 bg-background border-2 border-border rounded-large text-text text-lg focus:outline-none focus:border-primary sm:px-4 sm:py-3 sm:pl-10 sm:text-base"
              />
              <FiSearch
                size={24}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary sm:left-3 sm:w-5 sm:h-5"
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-white px-6 py-4 rounded-large font-semibold flex items-center gap-2 hover:bg-red-600 transition-all duration-200 w-full sm:w-auto sm:px-4 sm:py-3"
            >
              <FiSearch size={20} className="w-5 h-5" />
              Buscar
            </button>
          </form>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b-2 border-border overflow-x-auto sm:mb-6">
        <button
          onClick={() => handleTabChange('search')}
          className={`px-4 py-2 font-semibold transition-all duration-200 whitespace-nowrap flex items-center gap-1 flex-1 justify-center min-w-0 sm:px-3 sm:py-1 sm:text-sm ${
            activeTab === 'search'
              ? 'text-primary border-b-3 border-primary'
              : 'text-textSecondary hover:text-text'
          }`}
        >
          <FiSearch size={18} className="w-4 h-4" />
          Busca
        </button>
        <button
          onClick={() => handleTabChange('trending')}
          className={`px-4 py-2 font-semibold transition-all duration-200 whitespace-nowrap flex items-center gap-1 flex-1 justify-center min-w-0 sm:px-3 sm:py-1 sm:text-sm ${
            activeTab === 'trending'
              ? 'text-primary border-b-3 border-primary'
              : 'text-textSecondary hover:text-text'
          }`}
        >
          <FiTrendingUp size={18} className="w-4 h-4" />
          Em Alta
        </button>
        <button
          onClick={() => handleTabChange('popular')}
          className={`px-4 py-2 font-semibold transition-all duration-200 whitespace-nowrap flex items-center gap-1 flex-1 justify-center min-w-0 sm:px-3 sm:py-1 sm:text-sm ${
            activeTab === 'popular'
              ? 'text-primary border-b-3 border-primary'
              : 'text-textSecondary hover:text-text'
          }`}
        >
          <FiStar size={18} className="w-4 h-4" />
          Populares
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-textSecondary">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mb-4"></div>
          <p>Carregando filmes...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-error text-lg">
          {error}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-12 text-textSecondary">
          <FiFilm size={64} className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-xl mb-2 text-text">Nenhum filme encontrado</h3>
          <p>Tente buscar por outro termo ou explore nossas categorias</p>
        </div>
      ) : (
        <>
          {/* Movies Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-4">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onDetailsClick={handleMovieClick}
                onFavoriteChange={handleFavoriteChange}
                isFavorite={isMovieFavorite(movie.id)}
                variant={isMovieFavorite(movie.id) ? 'remove' : 'add'}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-surface text-text border border-border px-4 py-2 rounded-small cursor-pointer transition-all duration-200 hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              <span className="text-textSecondary">
                Página {currentPage} de {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-surface text-text border border-border px-4 py-2 rounded-small cursor-pointer transition-all duration-200 hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}

      {/* Movie Modal */}
      <MovieModal
        movie={selectedMovie}
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
        isFavorite={selectedMovie ? isMovieFavorite(selectedMovie.id) : false}
        onFavoriteChange={handleModalFavoriteChange}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export default HomePage;