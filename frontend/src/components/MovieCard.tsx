import React, { useState } from 'react';
import styled from 'styled-components';
import { FiHeart, FiPlus, FiStar, FiCalendar, FiInfo, FiFilm } from 'react-icons/fi';
import { useUser } from '../hooks/useUser';
import { favoritesAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onDetailsClick?: (movie: Movie) => void;
  onFavoriteRemoved?: (movieId: number) => void;
  onFavoriteChange?: (movieId: number, isFavorite: boolean) => void;
  isFavorite?: boolean;
  showActions?: boolean;
  variant?: 'add' | 'remove';
}

const MovieCardContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.large};
  }
`;

const MoviePoster = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 150%;
  background-color: ${({ theme }) => theme.colors.background};
  overflow: hidden;
`;

const PosterImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  ${MovieCardContainer}:hover & {
    transform: scale(1.05);
  }
`;

const PosterPlaceholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.surface}, ${({ theme }) => theme.colors.background});
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const MovieInfo = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

const MovieTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  min-height: 2.8em; /* Força altura de duas linhas (1.4 * 2 = 2.8) */

  @media (min-width: 480px) {
    font-size: 1rem;
    line-height: 1.4;
    min-height: 2.8em; /* Mantém altura consistente */
  }

  @media (max-width: 380px) {
    font-size: 0.85rem;
    line-height: 1.4;
    min-height: 2.4em; /* Ajustado para fonte menor */
  }
`;

const MovieMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.rating};
  font-weight: 600;
`;

const Year = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const MovieActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
  flex-direction: column;

  @media (min-width: 480px) {
    flex-direction: row;
  }
`;

interface ActionButtonProps {
  variant?: 'favorite' | 'remove' | 'details';
}

const ActionButton = styled.button<ActionButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
  width: 100%;
  min-height: 40px;

  @media (min-width: 480px) {
    flex: 1;
    font-size: 0.9rem;
    padding: ${({ theme }) => theme.spacing.sm};
  }

  ${({ variant, theme }) => {
    switch (variant) {
      case 'favorite':
        return `
          background-color: ${theme.colors.primary};
          color: white;
          &:hover {
            background-color: #f40612;
          }
        `;
      case 'remove':
        return `
          background-color: ${theme.colors.error};
          color: white;
          &:hover {
            background-color: #d60a02;
          }
        `;
      case 'details':
        return `
          background-color: ${theme.colors.background};
          color: ${theme.colors.text};
          border: 1px solid ${theme.colors.border};
          &:hover {
            background-color: ${theme.colors.surface};
            border-color: ${theme.colors.primary};
          }
        `;
      default:
        return '';
    }
  }}
`;

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onDetailsClick,
  onFavoriteRemoved,
  onFavoriteChange,
  isFavorite = false,
  showActions = true,
  variant = 'add'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { username, isLoggedIn } = useUser();

  const handleFavoriteClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error('Você precisa estar logado para adicionar filmes aos favoritos');
      return;
    }

    setIsLoading(true);

    try {
      if (variant === 'add') {
        await favoritesAPI.addFavorite(username, movie.id, movie);
        toast.success('Filme adicionado aos favoritos!');
        onFavoriteChange?.(movie.id, true);
      } else {
        await favoritesAPI.removeFavorite(username, movie.id);
        toast.success('Filme removido dos favoritos!');
        onFavoriteChange?.(movie.id, false);
        onFavoriteRemoved?.(movie.id);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao processar favorito';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = () => {
    if (onDetailsClick) {
      onDetailsClick(movie);
    }
  };

  const formatDate = (dateString: string | null): number | string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).getFullYear();
  };

  return (
    <MovieCardContainer onClick={handleCardClick}>
      <MoviePoster>
        {movie.poster ? (
          <PosterImage
            src={movie.poster}
            alt={`${movie.title} poster`}
            loading="lazy"
          />
        ) : (
          <PosterPlaceholder>
            <FiFilm size={48} />
            <span>Sem Imagem</span>
          </PosterPlaceholder>
        )}
      </MoviePoster>

      <MovieInfo>
        <MovieTitle>{movie.title}</MovieTitle>

        <MovieMeta>
          <Rating>
            <FiStar size={16} />
            {movie.rating ? movie.rating.toFixed(1) : 'N/A'}
          </Rating>
          <Year>
            <FiCalendar size={14} />
            {formatDate(movie.releaseDate)}
          </Year>
        </MovieMeta>

        {showActions && (
          <MovieActions>
            {isLoggedIn ? (
              <ActionButton
                variant={variant === 'add' ? 'favorite' : 'remove'}
                onClick={handleFavoriteClick}
                disabled={isLoading}
              >
                {variant === 'add' ? <FiPlus size={16} /> : <FiHeart size={16} />}
                {variant === 'add' ? 'Favoritar' : 'Remover'}
              </ActionButton>
            ) : (
              <ActionButton variant="favorite" disabled>
                <FiPlus size={16} />
                Favoritar
              </ActionButton>
            )}

            <ActionButton
              variant="details"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                handleCardClick();
              }}
            >
              <FiInfo size={16} />
              Detalhes
            </ActionButton>
          </MovieActions>
        )}
      </MovieInfo>
    </MovieCardContainer>
  );
};

export default MovieCard;