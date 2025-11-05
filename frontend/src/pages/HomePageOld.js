import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FiSearch, FiTrendingUp, FiStar, FiFilm, FiLoader } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import MovieModal from '../components/MovieModal';
import LoginModal from '../components/LoginModal';
import { movieAPI, favoritesAPI } from '../services/api';
import { useUser } from '../hooks/useUser';

const HomePageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const HeroSection = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.surface}, ${({ theme }) => theme.colors.background});
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
  text-align: center;
  border-radius: ${({ theme }) => theme.borderRadius.large};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 1rem;
  }
`;

const SearchContainer = styled.div`
  max-width: 600px;
  margin: 0 auto ${({ theme }) => theme.spacing.xl};
  position: relative;
`;

const SearchForm = styled.form`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SearchInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg};
  padding-left: 3rem;
  background-color: ${({ theme }) => theme.colors.background};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.1rem;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.md};
    padding-left: 2.5rem;
    font-size: 1rem;
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: ${({ theme }) => theme.spacing.lg};
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.2rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    left: ${({ theme }) => theme.spacing.md};
    font-size: 1rem;
  }
`;

const SearchButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: all 0.2s ease;

  &:hover {
    background-color: #f40612;
    transform: translateY(-2px);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.md};
    font-size: 0.9rem;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  overflow-x: auto;
`;

const Tab = styled.button`
  background: none;
  border: none;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  color: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary : theme.colors.textSecondary
  };
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  border-bottom: 3px solid ${({ theme, isActive }) =>
    isActive ? theme.colors.primary : 'transparent'
  };
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    font-size: 0.9rem;
  }
`;

const MoviesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: ${({ theme }) => theme.spacing.md};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const LoadingIcon = styled(FiLoader)`
  animation: spin 1s linear infinite;
  font-size: 3rem;
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.error};
  font-size: 1.1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.textSecondary};

  h3 {
    font-size: 1.5rem;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const PaginationButton = styled.button`
  background-color: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary : theme.colors.surface
  };
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('search');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [favoriteMovies, setFavoriteMovies] = useState(new Set());

  const { isLoggedIn, username } = useUser();

  useEffect(() => {
    const search = searchParams.get('search');
    const login = searchParams.get('login');

    if (login === 'true' && !isLoggedIn) {
      setShowLoginModal(true);
      searchParams.delete('login');
      setSearchParams(searchParams);
    }

    if (search) {
      setSearchQuery(search);
      setActiveTab('search');
      handleSearch(search);
    } else {
      loadTrendingMovies();
    }

    if (isLoggedIn) {
      loadFavoriteMovies();
    }
  }, [searchParams, isLoggedIn, username, setSearchParams]);

  const loadFavoriteMovies = useCallback(async () => {
    try {
      const response = await favoritesAPI.getFavorites(username);
      const favorites = new Set(response.data.favorites.map(fav => fav.movie_id));
      setFavoriteMovies(favorites);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  }, [username]);

  const loadTrendingMovies = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await movieAPI.getTrendingMovies('week', page);
      setMovies(response.data.movies);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      setError('Erro ao carregar filmes em alta. Tente novamente.');
      console.error('Erro ao carregar filmes em alta:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPopularMovies = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await movieAPI.getPopularMovies(page);
      setMovies(response.data.movies);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      setError('Erro ao carregar filmes populares. Tente novamente.');
      console.error('Erro ao carregar filmes populares:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query, page = 1) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await movieAPI.searchMovies(query, page);
      setMovies(response.data.movies);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
      setActiveTab('search');
    } catch (error) {
      setError('Erro ao buscar filmes. Tente novamente.');
      console.error('Erro ao buscar filmes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);

    switch (tab) {
      case 'trending':
        loadTrendingMovies();
        break;
      case 'popular':
        loadPopularMovies();
        break;
      case 'search':
        if (searchQuery.trim()) {
          handleSearch(searchQuery);
        }
        break;
      default:
        console.warn('Unknown tab:', tab);
        loadTrendingMovies();
        break;
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
      setSearchParams({ search: searchQuery });
    }
  };

  const handleMovieClick = async (movie) => {
    try {
      const response = await movieAPI.getMovieDetails(movie.id);
      setSelectedMovie(response.data);
    } catch (error) {
      setError('Erro ao carregar detalhes do filme.');
      console.error('Erro ao carregar detalhes:', error);
    }
  };

  const handleFavoriteChange = (isFavorite) => {
    if (selectedMovie) {
      const newFavorites = new Set(favoriteMovies);
      if (isFavorite) {
        newFavorites.add(selectedMovie.id);
      } else {
        newFavorites.delete(selectedMovie.id);
      }
      setFavoriteMovies(newFavorites);
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;

    switch (activeTab) {
      case 'trending':
        loadTrendingMovies(page);
        break;
      case 'popular':
        loadPopularMovies(page);
        break;
      case 'search':
        handleSearch(searchQuery, page);
        break;
      default:
        console.warn('Unknown tab:', activeTab);
        loadTrendingMovies(page);
        break;
    }
  };

  const isMovieFavorite = (movieId) => {
    return favoriteMovies.has(movieId);
  };

  return (
    <HomePageContainer>
      <HeroSection>
        <HeroTitle>Bem-vindo ao MovieList</HeroTitle>
        <HeroSubtitle>Descubra, organize e compartilhe seus filmes favoritos</HeroSubtitle>

        <SearchContainer>
          <SearchForm onSubmit={handleSearchSubmit}>
            <SearchIcon size={24} />
            <SearchInput
              type="text"
              placeholder="Buscar filmes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchButton type="submit">
              <FiSearch size={20} />
              Buscar
            </SearchButton>
          </SearchForm>
        </SearchContainer>
      </HeroSection>

      <TabsContainer>
        <Tab
          isActive={activeTab === 'search'}
          onClick={() => handleTabChange('search')}
        >
          <FiSearch size={18} />
          Busca
        </Tab>
        <Tab
          isActive={activeTab === 'trending'}
          onClick={() => handleTabChange('trending')}
        >
          <FiTrendingUp size={18} />
          Em Alta
        </Tab>
        <Tab
          isActive={activeTab === 'popular'}
          onClick={() => handleTabChange('popular')}
        >
          <FiStar size={18} />
          Populares
        </Tab>
      </TabsContainer>

      {loading ? (
        <LoadingContainer>
          <LoadingIcon />
          <p>Carregando filmes...</p>
        </LoadingContainer>
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : movies.length === 0 ? (
        <EmptyState>
          <FiFilm size={64} />
          <h3>Nenhum filme encontrado</h3>
          <p>Tente buscar por outro termo ou explore nossas categorias</p>
        </EmptyState>
      ) : (
        <>
          <MoviesGrid>
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onDetailsClick={handleMovieClick}
                variant={isMovieFavorite(movie.id) ? 'remove' : 'add'}
              />
            ))}
          </MoviesGrid>

          {totalPages > 1 && (
            <PaginationContainer>
              <PaginationButton
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </PaginationButton>

              <span style={{ color: 'var(--text-secondary)' }}>
                Página {currentPage} de {totalPages}
              </span>

              <PaginationButton
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próxima
              </PaginationButton>
            </PaginationContainer>
          )}
        </>
      )}

      <MovieModal
        movie={selectedMovie}
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
        isFavorite={selectedMovie ? isMovieFavorite(selectedMovie.id) : false}
        onFavoriteChange={handleFavoriteChange}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </HomePageContainer>
  );
};

export default HomePage;