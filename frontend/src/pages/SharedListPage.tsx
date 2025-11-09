import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiHeart, FiCalendar, FiStar, FiUser, FiExternalLink, FiShare2, FiAlertCircle } from 'react-icons/fi';
import MovieCard from '../components/MovieCard';
import MovieModal from '../components/MovieModal';
import { sharedAPI } from '../services/api';

const SharedListPageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.surface}, ${({ theme }) => theme.colors.background});
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  text-align: center;
`;

const HeaderIcon = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${({ theme }) => theme.spacing.lg};
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 2rem;
  }
`;

const Username = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: 1.3rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ListMeta = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ShareInfo = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`;

interface ActionButtonProps {
  variant?: 'primary' | 'secondary';
}

const ActionButton = styled(Link)<ActionButtonProps>`
  background-color: ${({ theme, variant }) =>
    variant === 'primary' ? theme.colors.primary : theme.colors.background
  };
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
  gap: ${({ theme }) => theme.spacing.sm};
  transition: all 0.2s ease;
  text-decoration: none;

  &:hover {
    background-color: ${({ theme, variant }) =>
      variant === 'primary' ? '#f40612' : theme.colors.surface
    };
    transform: translateY(-2px);
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
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  text-align: center;
  max-width: 600px;
  margin: 0 auto;

  h3 {
    font-size: 1.5rem;
    margin-bottom: ${({ theme }) => theme.spacing.md};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing.sm};
  }
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
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing.sm};
  }

  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

const SharedListPage = () => {
  const { shareToken } = useParams<string>();
  const [sharedList, setSharedList] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

  // useEffect principal - tudo dentro para evitar problemas de inicialização
  useEffect(() => {
    const loadSharedList = async () => {
      try {
        setLoading(true);
        if (!shareToken) {
          throw new Error('Share token is required');
        }
        const response = await sharedAPI.getSharedList(shareToken);
        setSharedList(response.data);
      } catch (error: any) {
        if (error.response?.status === 404) {
          setError('Este link de compartilhamento não foi encontrado ou expirou.');
        } else {
          setError('Erro ao carregar a lista compartilhada. Tente novamente.');
        }
        console.error('Erro ao carregar lista compartilhada:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSharedList();
  }, [shareToken]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateAverageRating = (movies: any[]): string => {
    if (!movies.length) return '0';
    const sum = movies.reduce((acc, movie) => acc + (movie.movie_rating || 0), 0);
    return (sum / movies.length).toFixed(1);
  };

  const handleShareLink = async () => {
    try {
      const shareUrl = window.location.href;
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copiado para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar link:', error);
    }
  };

  if (loading) {
    return (
      <SharedListPageContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <p>Carregando lista compartilhada...</p>
        </LoadingContainer>
      </SharedListPageContainer>
    );
  }

  if (error) {
    return (
      <SharedListPageContainer>
        <ErrorMessage>
          <h3>
            <FiAlertCircle size={24} />
            Link Inválido
          </h3>
          <p>{error}</p>
          <ActionButton to="/" variant="primary">
            Voltar para Página Inicial
          </ActionButton>
        </ErrorMessage>
      </SharedListPageContainer>
    );
  }

  return (
    <SharedListPageContainer>
      <PageHeader>
        <HeaderIcon>
          <FiShare2 size={40} color="white" />
        </HeaderIcon>
        <PageTitle>Lista Compartilhada</PageTitle>
        <Username>
          <FiUser size={20} />
          {sharedList.username}
        </Username>

        <ListMeta>
          <MetaItem>
            <FiHeart size={18} />
            {sharedList.totalMovies} filmes
          </MetaItem>
          <MetaItem>
            <FiStar size={18} />
            {calculateAverageRating(sharedList.favorites)} média
          </MetaItem>
          <MetaItem>
            <FiCalendar size={18} />
            Criada em {formatDate(sharedList.createdAt)}
          </MetaItem>
        </ListMeta>

        <ShareInfo>
          {sharedList.expiresAt ? (
            <span>Este link expira em {formatDate(sharedList.expiresAt)}</span>
          ) : (
            <span>Este link não expira</span>
          )}
        </ShareInfo>

        <ActionButtons>
          <ActionButton to="/" variant="primary">
            Criar Sua Própria Lista
          </ActionButton>
          <ActionButton
            to="#"
            variant="secondary"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              handleShareLink();
            }}
          >
            <FiExternalLink size={18} />
            Compartilhar Link
          </ActionButton>
        </ActionButtons>
      </PageHeader>

      {sharedList.favorites.length === 0 ? (
        <EmptyState>
          <h3>
            <FiHeart size={32} />
            Lista Vazia
          </h3>
          <p>{sharedList.username} ainda não adicionou nenhum filme à sua lista de favoritos.</p>
        </EmptyState>
      ) : (
        <MoviesGrid>
          {sharedList.favorites.map((favorite: any) => (
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
              showActions={false}
            />
          ))}
        </MoviesGrid>
      )}

      <MovieModal
        movie={selectedMovie}
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </SharedListPageContainer>
  );
};

export default SharedListPage;