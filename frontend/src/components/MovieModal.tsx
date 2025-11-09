import React from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiStar, FiCalendar, FiClock, FiUsers, FiPlay, FiHeart, FiPlus } from 'react-icons/fi';
import { useUser } from '../hooks/useUser';
import { favoritesAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Movie } from '../types';

interface MovieModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite?: boolean;
  onFavoriteChange?: (isFavorite: boolean) => void;
}

const MovieModal: React.FC<MovieModalProps> = ({ movie, isOpen, onClose, isFavorite = false, onFavoriteChange }) => {
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
    } catch (error: any) {
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

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRuntime = (minutes: number): string => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6 sm:p-4" onClick={onClose}>
      <div className="bg-surface rounded-large max-w-4xl max-h-[90vh] overflow-y-auto relative w-full sm:max-h-[100vh] sm:rounded-none sm:max-w-full" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-background text-text border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer z-10 transition-all duration-200 hover:bg-error hover:rotate-90"
        >
          <FiX size={24} />
        </button>

        <div className="relative h-[300px] bg-gradient-to-b from-transparent to-surface overflow-hidden sm:h-[200px]">
          <img
            src={movie.backdrop || movie.poster || ''}
            alt={`${movie.title} backdrop`}
            className="absolute inset-0 w-full h-full object-cover brightness-[0.4]"
          />
        </div>

        <div className="px-8 pt-0 sm:px-6">
          <div className="mt-[-100px] mb-8 relative z-2 sm:mt-[-50px] sm:mb-6">
            <h1 className="text-[2.5rem] font-bold text-text mb-2 sm:text-[1.8rem]">
              {movie.title}
            </h1>
            {movie.originalTitle !== movie.title && (
              <p className="text-[1.2rem] text-textSecondary italic mb-3 sm:text-base">
                {movie.originalTitle}
              </p>
            )}

            <div className="flex gap-6 mb-6 flex-wrap sm:gap-4">
              <div className="flex items-center gap-2 text-rating font-semibold text-[1.1rem]">
                <FiStar size={20} />
                {movie.rating ? `${movie.rating.toFixed(1)}/10` : 'N/A'}
              </div>

              <div className="flex items-center gap-2 text-text">
                <FiCalendar size={18} />
                {formatDate(movie.releaseDate)}
              </div>

              {movie.runtime && (
                <div className="flex items-center gap-2 text-text">
                  <FiClock size={18} />
                  {formatRuntime(movie.runtime)}
                </div>
              )}

              {movie.director && (
                <div className="flex items-center gap-2 text-text">
                  <FiUsers size={18} />
                  Diretor: {movie.director}
                </div>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-[1.5rem] font-semibold text-text mb-4">Sinopse</h2>
            <p className="leading-[1.8] text-textSecondary text-[1.1rem] sm:text-base">
              {movie.overview || 'Sinopse não disponível.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {movie.genres && movie.genres.length > 0 && (
              <div className="bg-background p-6 rounded-medium">
                <h3 className="text-[1.1rem] font-semibold text-text mb-2">Gêneros</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <span key={genre.id} className="bg-primary text-white px-2 py-1 rounded-small text-sm">
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {movie.cast && movie.cast.length > 0 && (
              <div className="bg-background p-6 rounded-medium">
                <h3 className="text-[1.1rem] font-semibold text-text mb-2">Elenco Principal</h3>
                <div className="text-textSecondary">
                  {movie.cast.slice(0, 5).join(', ')}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-8 pt-6 border-t border-border sm:flex-col">
            {isLoggedIn ? (
              <button
                onClick={handleFavoriteClick}
                className={`flex items-center gap-2 px-6 py-3 rounded-medium text-base font-semibold cursor-pointer transition-all duration-200 flex-1 justify-center ${
                  isFavorite
                    ? 'bg-error text-white hover:bg-red-700'
                    : 'bg-primary text-white hover:bg-red-600'
                } sm:w-full`}
              >
                {isFavorite ? <FiHeart size={20} /> : <FiPlus size={20} />}
                {isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
              </button>
            ) : (
              <button
                disabled
                className="bg-primary text-white px-6 py-3 rounded-medium text-base font-semibold flex items-center gap-2 transition-all duration-200 flex-1 justify-center sm:w-full disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <FiPlus size={20} />
                Adicionar aos Favoritos
              </button>
            )}

            {movie.trailer && (
              <button
                onClick={handleTrailerClick}
                className="bg-background text-text border-2 border-border px-6 py-3 rounded-medium text-base font-semibold cursor-pointer transition-all duration-200 flex-1 justify-center hover:bg-surface hover:border-primary sm:w-full"
              >
                <FiPlay size={20} />
                Assistir Trailer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default MovieModal;