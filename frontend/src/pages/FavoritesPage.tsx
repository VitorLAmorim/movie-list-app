import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiHeart, FiShare2, FiTrash2, FiCopy, FiStar, FiFilm, FiExternalLink } from 'react-icons/fi';
import { useUser } from '../hooks/useUser';
import MovieCard from '../components/MovieCard';
import MovieModal from '../components/MovieModal';
import { favoritesAPI, sharedAPI } from '../services/api';
import { toast } from 'react-toastify';

const FavoritesPageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 0 ${({ theme }) => theme.spacing.sm};
    max-width: 100%;
  }
`;

const PageHeader = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.surface}, ${({ theme }) => theme.colors.background});
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: column;
    align-items: stretch;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const HeaderInfo = styled.div`
  flex: 1;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 2.2rem;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 1.8rem;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
    text-align: center;
  }
`;

const PageSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.1rem;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StatsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const StatValue = styled.span`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const StatLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const HeaderActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: row;
    justify-content: stretch;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 100%;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

interface ActionButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
}

const ActionButton = styled.button<ActionButtonProps>`
  background-color: ${({ theme, variant }) => {
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.background;
      case 'danger':
        return theme.colors.error;
      default:
        return theme.colors.background;
    }
  }};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme, variant }) =>
    variant === 'primary' ? theme.colors.primary : theme.colors.border
  };
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: ${({ theme, variant }) => {
      switch (variant) {
        case 'primary':
          return '#f40612';
        case 'secondary':
          return theme.colors.surface;
        case 'danger':
          return '#d60a02';
        default:
          return theme.colors.surface;
      }
    }};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex: 1;
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    font-size: 0.9rem;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 0.8rem;
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.sm};
    min-height: 44px;
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
  background-color: ${({ theme }) => theme.colors.error};
  color: white;
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  border: 2px dashed ${({ theme }) => theme.colors.border};

  h3 {
    font-size: 1.5rem;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    color: ${({ theme }) => theme.colors.text};
  }

  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

const ShareLinksSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const ShareLinksHeader = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ShareLinkItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
    align-items: stretch;
  }
`;

const ShareLinkInfo = styled.div`
  flex: 1;
`;

const ShareLinkDate = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ShareLinkUrl = styled.div`
  font-family: monospace;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.primary};
  word-break: break-all;
`;

const ShareLinkActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    justify-content: stretch;
  }
`;

interface MiniButtonProps {
  variant?: 'copy' | 'visit' | 'delete';
}

const MiniButton = styled.button<MiniButtonProps>`
  background-color: ${({ theme, variant }) => {
    switch (variant) {
      case 'copy':
        return theme.colors.primary;
      case 'visit':
        return theme.colors.background;
      case 'delete':
        return theme.colors.error;
      default:
        return theme.colors.background;
    }
  }};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme, variant }) =>
    variant === 'copy' ? theme.colors.primary : theme.colors.border
  };
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex: 1;
    justify-content: center;
  }
`;

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, averageRating: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [shareLinks, setShareLinks] = useState<any[]>([]);
  const [isCreatingShareLink, setIsCreatingShareLink] = useState<boolean>(false);

  const { username, isLoggedIn } = useUser();

  // useEffect para carregar dados com controle de execução
  useEffect(() => {

    const loadData = async () => {
      if (!isLoggedIn || !username) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Carregar favoritos
        const favoritesResponse = await favoritesAPI.getFavorites(username);
          setFavorites(favoritesResponse.data.favorites);
          setStats(favoritesResponse.data.stats);

        // Carregar links compartilhados
        const shareLinksResponse = await sharedAPI.getUserSharedLinks(username);
        const frontendUrl = window.location.origin;
        const convertedLinks = shareLinksResponse.data.sharedLinks.map((link: any) => ({
          ...link,
          shareUrl: `${frontendUrl}/shared/${link.shareToken}`
        }));
        setShareLinks(convertedLinks);

      } catch (error: any) {
          setError('Erro ao carregar favoritos. Tente novamente.');
          console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isLoggedIn, username]);

  const handleCreateShareLink = async () => {
    try {
      setIsCreatingShareLink(true);
      const response = await sharedAPI.createShareLink(username);

      // Construir URL do frontend usando o shareToken
      const frontendUrl = window.location.origin;
      const shareUrl = `${frontendUrl}/shared/${response.data.shareToken}`;

      const newShareLink = {
        shareToken: response.data.shareToken,
        shareUrl: shareUrl,
        createdAt: new Date().toISOString(),
        expiresAt: response.data.expiresAt,
        isExpired: false
      };
      setShareLinks(prev => [newShareLink, ...prev]);
      toast.success('Link de compartilhamento criado com sucesso!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao criar link de compartilhamento';
      toast.error(errorMessage);
    } finally {
      setIsCreatingShareLink(false);
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado para a área de transferência!');
    } catch (error) {
      toast.error('Erro ao copiar link');
    }
  };

  const handleDeleteShareLink = async (shareToken: string) => {
    try {
      await sharedAPI.deleteShareLink(username, shareToken);
      setShareLinks(prev => prev.filter(link => link.shareToken !== shareToken));
      toast.success('Link removido com sucesso!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao remover link';
      toast.error(errorMessage);
    }
  };

  const handleClearAllFavorites = async () => {
    if (!window.confirm('Tem certeza que deseja remover todos os filmes da sua lista?')) {
      return;
    }

    try {
      const deletePromises = favorites.map(favorite =>
        favoritesAPI.removeFavorite(username, favorite.movie_id)
      );
      await Promise.all(deletePromises);
      setFavorites([]);
      setStats({ total: 0, averageRating: 0 });
      toast.success('Todos os favoritos foram removidos!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao limpar favoritos';
      toast.error(errorMessage);
    }
  };

  const handleFavoriteRemoved = (movieId: number) => {
    setFavorites(prev => prev.filter(fav => fav.movie_id !== movieId));
    const newTotal = favorites.length - 1;
    const newAverage = newTotal > 0
      ? (stats.averageRating * stats.total - (favorites.find(f => f.movie_id === movieId)?.movie_rating || 0)) / newTotal
      : 0;
    setStats({ total: newTotal, averageRating: newAverage });
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isLoggedIn) {
    return (
      <FavoritesPageContainer>
        <EmptyState>
          <FiHeart size={64} />
          <h3>Entre para ver seus favoritos</h3>
          <p>Faça login para criar e gerenciar sua lista de filmes favoritos</p>
        </EmptyState>
      </FavoritesPageContainer>
    );
  }

  if (loading) {
    return (
      <FavoritesPageContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <p>Carregando seus favoritos...</p>
        </LoadingContainer>
      </FavoritesPageContainer>
    );
  }

  if (error) {
    return (
      <FavoritesPageContainer>
        <ErrorMessage>{error}</ErrorMessage>
      </FavoritesPageContainer>
    );
  }

  return (
    <FavoritesPageContainer>
      <PageHeader>
        <HeaderContent>
          <HeaderInfo>
            <PageTitle>
              <FiHeart size={32} />
              Meus Favoritos
            </PageTitle>
            <PageSubtitle>
              Lista de filmes favoritos de {username}
            </PageSubtitle>
            <StatsContainer>
              <StatItem>
                <FiFilm size={20} />
                <div>
                  <StatValue>{stats.total}</StatValue>
                  <StatLabel>Filmes</StatLabel>
                </div>
              </StatItem>
              <StatItem>
                <FiStar size={20} />
                <div>
                  <StatValue>{stats.averageRating.toFixed(1)}</StatValue>
                  <StatLabel>Média</StatLabel>
                </div>
              </StatItem>
            </StatsContainer>
          </HeaderInfo>

          <HeaderActions>
            <ActionButton
              variant="primary"
              onClick={handleCreateShareLink}
              disabled={isCreatingShareLink || favorites.length === 0}
            >
              <FiShare2 size={18} />
              {isCreatingShareLink ? 'Criando...' : 'Compartilhar Lista'}
            </ActionButton>
            <ActionButton
              variant="danger"
              onClick={handleClearAllFavorites}
              disabled={favorites.length === 0}
            >
              <FiTrash2 size={18} />
              Limpar Tudo
            </ActionButton>
          </HeaderActions>
        </HeaderContent>
      </PageHeader>

      {favorites.length === 0 ? (
        <EmptyState>
          <FiHeart size={64} />
          <h3>Nenhum favorito ainda</h3>
          <p>Explore filmes e adicione seus favoritos para criar sua lista pessoal</p>
        </EmptyState>
      ) : (
        <>
          <MoviesGrid>
            {favorites.map((favorite) => (
              <MovieCard
                key={favorite.id}
                movie={{
                  id: favorite.movie_id,
                  title: favorite.movie_title,
                  originalTitle: favorite.movie_title,
                  overview: favorite.movie_overview,
                  releaseDate: favorite.movie_release_date,
                  rating: favorite.movie_rating,
                  voteCount: 0,
                  poster: favorite.movie_poster,
                  backdrop: null,
                  genres: [],
                  runtime: 0,
                }}
                onDetailsClick={(movie: any) => setSelectedMovie(movie)}
                onFavoriteRemoved={handleFavoriteRemoved}
                variant="remove"
              />
            ))}
          </MoviesGrid>

          {shareLinks.length > 0 && (
            <ShareLinksSection>
              <ShareLinksHeader>Links Compartilhados</ShareLinksHeader>
              {shareLinks.map((link) => (
                <ShareLinkItem key={link.shareToken}>
                  <ShareLinkInfo>
                    <ShareLinkDate>
                      Criado em {formatDate(link.createdAt)}
                      {link.expiresAt && ` • Expira em ${formatDate(link.expiresAt)}`}
                    </ShareLinkDate>
                    <ShareLinkUrl>{link.shareUrl}</ShareLinkUrl>
                  </ShareLinkInfo>
                  <ShareLinkActions>
                    <MiniButton
                      variant="copy"
                      onClick={() => handleCopyLink(link.shareUrl)}
                    >
                      <FiCopy size={14} />
                      Copiar
                    </MiniButton>
                    <MiniButton
                      variant="visit"
                      onClick={() => window.open(link.shareUrl, '_blank')}
                    >
                      <FiExternalLink size={14} />
                      Visitar
                    </MiniButton>
                    <MiniButton
                      variant="delete"
                      onClick={() => handleDeleteShareLink(link.shareToken)}
                    >
                      <FiTrash2 size={14} />
                      Remover
                    </MiniButton>
                  </ShareLinkActions>
                </ShareLinkItem>
              ))}
            </ShareLinksSection>
          )}
        </>
      )}

      <MovieModal
        movie={selectedMovie}
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
        isFavorite={true}
        onFavoriteChange={() => {
          if (selectedMovie) {
            handleFavoriteRemoved(selectedMovie.id);
          }
        }}
      />
    </FavoritesPageContainer>
  );
};

export default FavoritesPage;