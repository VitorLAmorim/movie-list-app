import React, { useState } from 'react';
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
    <div
      onClick={handleCardClick}
      className="bg-surface rounded-medium shadow-medium overflow-hidden transition-all duration-300 relative cursor-pointer hover:translate-y-[-5px] hover:shadow-large group"
    >
      {/* Movie Poster */}
      <div className="relative w-full aspect-movie bg-background overflow-hidden">
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={`${movie.title} poster`}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface to-background text-text-secondary">
            <FiFilm size={48} className="w-12 h-12" />
            <span className="mt-2">Sem Imagem</span>
          </div>
        )}
      </div>

      {/* Movie Info */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-text mb-1 line-clamp-2 leading-tight min-h-[2.8em] sm:text-base sm:min-h-[2.8em] text-xs sm:min-h-[2.4em]">
          {movie.title}
        </h3>

        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1 text-rating font-semibold">
            <FiStar size={16} className="w-4 h-4" />
            <span className="text-sm">{movie.rating ? movie.rating.toFixed(1) : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1 text-textSecondary text-sm">
            <FiCalendar size={14} className="w-3.5 h-3.5" />
            <span>{formatDate(movie.releaseDate)}</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 mt-2 flex-col sm:flex-row">
            {isLoggedIn ? (
              <button
                onClick={handleFavoriteClick}
                disabled={isLoading}
                className={`${
                  variant === 'add'
                    ? 'bg-primary hover:bg-red-600'
                    : 'bg-error hover:bg-red-700'
                } text-white px-3 py-2 rounded-small font-medium flex items-center justify-center gap-1 transition-all duration-200 w-full min-h-10 sm:flex-1 sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {variant === 'add' ? <FiPlus size={16} className="w-4 h-4" /> : <FiHeart size={16} className="w-4 h-4" />}
                {variant === 'add' ? 'Favoritar' : 'Remover'}
              </button>
            ) : (
              <button
                disabled
                className="bg-primary text-white px-3 py-2 rounded-small font-medium flex items-center justify-center gap-1 transition-all duration-200 w-full min-h-10 sm:flex-1 sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <FiPlus size={16} className="w-4 h-4" />
                Favoritar
              </button>
            )}

            <button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="bg-background text-text border border-border px-3 py-2 rounded-small font-medium flex items-center justify-center gap-1 transition-all duration-200 w-full min-h-10 sm:flex-1 sm:text-sm hover:bg-surface hover:border-primary"
            >
              <FiInfo size={16} className="w-4 h-4" />
              Detalhes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;