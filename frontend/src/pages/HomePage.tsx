import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FiSearch, FiTrendingUp, FiStar, FiFilm } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import MovieModal from '../components/MovieModal';
import LoginModal from '../components/LoginModal';
import { movieAPI, favoritesAPI } from '../services/api';
import { useUser } from '../hooks/useUser';

const HomePageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 0 ${({ theme }) => theme.spacing.sm};
    max-width: 100%;
  }
`;

const HeaderSection = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.surface}, ${({ theme }) => theme.colors.background});
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
  text-align: center;
  border-radius: ${({ theme }) => theme.borderRadius.large};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  margin-left: -${({ theme }) => theme.spacing.lg};
  margin-right: -${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    margin-left: -${({ theme }) => theme.spacing.sm};
    margin-right: -${({ theme }) => theme.spacing.sm};
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.sm};
  }
`;

const HeaderTitle = styled.h1`
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

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 1.5rem;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
`;

const HeaderSubtitle = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 1rem;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 0.9rem;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

const SearchContainer = styled.div`
  max-width: 600px;
  margin: 0 auto ${({ theme }) => theme.spacing.xl};
  position: relative;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    margin: 0 auto ${({ theme }) => theme.spacing.lg};
  }
`;

const SearchForm = styled.form`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
  }
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
    width: 100%;
    justify-content: center;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  overflow-x: auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

interface TabProps {
  isActive?: boolean;
}

const Tab = styled.button<TabProps>`
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
  flex: 1;
  justify-content: center;
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    font-size: 0.8rem;
    min-width: 0;
    flex: 1;
  }

  @media (max-width: 380px) {
    font-size: 0.7rem;
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
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

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid ${({ theme }) => theme.colors.border};
  border-top: 4px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
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

interface PaginationButtonProps {
  isActive?: boolean;
}

const PaginationButton = styled.button<PaginationButtonProps>`
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
    const loadFavorites = async () => {
      if (!isLoggedIn || !username) {
        setFavoriteMovies(new Set());
        return;
      }

      try {
        const response = await favoritesAPI.getFavorites(username);
          const favorites = new Set<number>(response.data.favorites.map((fav: any) => fav.movie_id));
          setFavoriteMovies(favorites);
      } catch (error) {
          console.error('Erro ao carregar favoritos:', error);
          setFavoriteMovies(new Set());
      }
    };
    loadFavorites();
  }, [isLoggedIn, username]);

  // useEffect para carregar filmes com controle de execução
  useEffect(() => {
    const loadMovies = async () => {
      const search = searchParams.get('search');

      setLoading(true);
      setError(null);

      try {
        let response;
        if (search) {
          setSearchQuery(search);
          setActiveTab('search');
          response = await movieAPI.searchMovies(search);
        } else {
          response = await movieAPI.getTrendingMovies('week');
        }

        if (response) {
          setMovies(response.data.movies);
          setCurrentPage(response.data.currentPage);
          setTotalPages(response.data.totalPages);
        }
      } catch (error) {
          setError('Erro ao carregar filmes. Tente novamente.');
          console.error('Erro ao carregar filmes:', error);
      } finally {
       setLoading(false);
      }
    };

    loadMovies();
  }, [searchParams.toString()]); // Usar toString para evitar re-renders desnecessários

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
    <HomePageContainer>
      <HeaderSection>
        <HeaderTitle>Bem-vindo ao MovieList</HeaderTitle>
        <HeaderSubtitle>Descubra, organize e compartilhe seus filmes favoritos</HeaderSubtitle>

        <SearchContainer>
          <SearchForm onSubmit={handleSearch}>
            <SearchInput
              type="text"
              placeholder="Buscar filmes..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
            <SearchButton type="submit">
              <FiSearch size={20} />
              Buscar
            </SearchButton>
          </SearchForm>
        </SearchContainer>
      </HeaderSection>

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
          <LoadingSpinner />
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
                onFavoriteChange={handleFavoriteChange}
                isFavorite={isMovieFavorite(movie.id)}
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
        onFavoriteChange={handleModalFavoriteChange}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </HomePageContainer>
  );
};

export default HomePage;