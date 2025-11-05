import React, { useState } from 'react';
import styled from 'styled-components';
import { FiHeart, FiPlus, FiStar, FiCalendar, FiInfo, FiFilm } from 'react-icons/fi';
import { useUser } from '../hooks/useUser';
import { favoritesAPI } from '../services/api';
import { toast } from 'react-toastify';

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
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
`;

const ActionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;

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

const MovieCard = ({ movie, onDetailsClick, showActions = true, variant = 'add' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { username, isLoggedIn } = useUser();

  const handleFavoriteClick = async (e) => {
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
      } else {
        await favoritesAPI.removeFavorite(username, movie.id);
        toast.success('Filme removido dos favoritos!');
      }
    } catch (error) {
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

  const formatDate = (dateString) => {
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
              onClick={(e) => {
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