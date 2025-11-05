import React from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { FiX, FiStar, FiCalendar, FiClock, FiUsers, FiPlay, FiHeart, FiPlus } from 'react-icons/fi';
import { useUser } from '../hooks/useUser';
import { favoritesAPI } from '../services/api';
import { toast } from 'react-toastify';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  width: 100%;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    max-height: 100vh;
    border-radius: 0;
    max-width: 100%;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.error};
    transform: rotate(90deg);
  }
`;

const MovieHeader = styled.div`
  position: relative;
  height: 300px;
  background: linear-gradient(to bottom, transparent, ${({ theme }) => theme.colors.surface});
  overflow: hidden;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    height: 200px;
  }
`;

const BackdropImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.4);
`;

const MovieDetails = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  padding-top: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const MovieTitleSection = styled.div`
  margin-top: -100px;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  position: relative;
  z-index: 2;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    margin-top: -50px;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

const MovieTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 1.8rem;
  }
`;

const MovieTagline = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-style: italic;
  margin-bottom: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 1rem;
  }
`;

const MovieMeta = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text};
`;

const Rating = styled(MetaItem)`
  color: ${({ theme }) => theme.colors.rating};
  font-weight: 600;
  font-size: 1.1rem;
`;

const MovieOverview = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const OverviewText = styled.p`
  line-height: 1.8;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.1rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 1rem;
  }
`;

const MovieAdditionalInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const InfoSection = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const InfoTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const GenreList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const GenreTag = styled.span`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 0.9rem;
`;

const CastList = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  justify-content: center;

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
      case 'trailer':
        return `
          background-color: ${theme.colors.background};
          color: ${theme.colors.text};
          border: 2px solid ${theme.colors.border};
          &:hover {
            background-color: ${theme.colors.surface};
            border-color: ${theme.colors.primary};
          }
        `;
      default:
        return '';
    }
  }}

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    width: 100%;
  }
`;

const MovieModal = ({ movie, isOpen, onClose, isFavorite = false, onFavoriteChange }) => {
  const { username, isLoggedIn } = useUser();

  if (!isOpen || !movie) return null;

  const handleFavoriteClick = async () => {
    if (!isLoggedIn) {
      toast.error('Você precisa estar logado para adicionar filmes aos favoritos');
      return;
    }

    try {
      if (isFavorite) {
        await favoritesAPI.removeFavorite(username, movie.id);
        toast.success('Filme removido dos favoritos!');
      } else {
        await favoritesAPI.addFavorite(username, movie.id, movie);
        toast.success('Filme adicionado aos favoritos!');
      }

      if (onFavoriteChange) {
        onFavoriteChange(!isFavorite);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao processar favorito';
      toast.error(errorMessage);
    }
  };

  const handleTrailerClick = () => {
    if (movie.trailer) {
      window.open(`https://www.youtube.com/watch?v=${movie.trailer}`, '_blank');
    } else {
      toast.info('Trailer não disponível');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const modalContent = (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <FiX size={24} />
        </CloseButton>

        <MovieHeader>
          <BackdropImage
            src={movie.backdrop || movie.poster}
            alt={`${movie.title} backdrop`}
          />
        </MovieHeader>

        <MovieDetails>
          <MovieTitleSection>
            <MovieTitle>{movie.title}</MovieTitle>
            {movie.originalTitle !== movie.title && (
              <MovieTagline>{movie.originalTitle}</MovieTagline>
            )}

            <MovieMeta>
              <Rating>
                <FiStar size={20} />
                {movie.rating ? `${movie.rating.toFixed(1)}/10` : 'N/A'}
              </Rating>

              <MetaItem>
                <FiCalendar size={18} />
                {formatDate(movie.releaseDate)}
              </MetaItem>

              {movie.runtime && (
                <MetaItem>
                  <FiClock size={18} />
                  {formatRuntime(movie.runtime)}
                </MetaItem>
              )}

              {movie.director && (
                <MetaItem>
                  <FiUsers size={18} />
                  Diretor: {movie.director}
                </MetaItem>
              )}
            </MovieMeta>
          </MovieTitleSection>

          <MovieOverview>
            <SectionTitle>Sinopse</SectionTitle>
            <OverviewText>
              {movie.overview || 'Sinopse não disponível.'}
            </OverviewText>
          </MovieOverview>

          <MovieAdditionalInfo>
            {movie.genres && movie.genres.length > 0 && (
              <InfoSection>
                <InfoTitle>Gêneros</InfoTitle>
                <GenreList>
                  {movie.genres.map((genre) => (
                    <GenreTag key={genre.id}>{genre.name}</GenreTag>
                  ))}
                </GenreList>
              </InfoSection>
            )}

            {movie.cast && movie.cast.length > 0 && (
              <InfoSection>
                <InfoTitle>Elenco Principal</InfoTitle>
                <CastList>
                  {movie.cast.slice(0, 5).join(', ')}
                </CastList>
              </InfoSection>
            )}
          </MovieAdditionalInfo>

          <ActionButtons>
            {isLoggedIn ? (
              <ActionButton
                variant={isFavorite ? 'remove' : 'favorite'}
                onClick={handleFavoriteClick}
              >
                {isFavorite ? <FiHeart size={20} /> : <FiPlus size={20} />}
                {isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
              </ActionButton>
            ) : (
              <ActionButton variant="favorite" disabled>
                <FiPlus size={20} />
                Adicionar aos Favoritos
              </ActionButton>
            )}

            {movie.trailer && (
              <ActionButton variant="trailer" onClick={handleTrailerClick}>
                <FiPlay size={20} />
                Assistir Trailer
              </ActionButton>
            )}
          </ActionButtons>
        </MovieDetails>
      </ModalContent>
    </ModalOverlay>
  );

  return createPortal(modalContent, document.body);
};

export default MovieModal;