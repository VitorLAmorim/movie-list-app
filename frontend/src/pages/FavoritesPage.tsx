import React, { useState, useEffect } from 'react';
import { FiHeart, FiShare2, FiTrash2, FiCopy, FiStar, FiFilm, FiExternalLink } from 'react-icons/fi';
import { useUser } from '../hooks/useUser';
import MovieCard from '../components/MovieCard';
import MovieModal from '../components/MovieModal';
import { favoritesAPI, sharedAPI } from '../services/api';
import { toast } from 'react-toastify';

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
    let isMounted = true;

    const loadData = async () => {
      if (!isLoggedIn || !username) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        if (isMounted) setLoading(true);

        // Carregar favoritos
        const favoritesResponse = await favoritesAPI.getFavorites(username);
        if (isMounted) {
          setFavorites(favoritesResponse.data.favorites);
          setStats(favoritesResponse.data.stats);
        }

        // Carregar links compartilhados
        const shareLinksResponse = await sharedAPI.getUserSharedLinks(username);
        if (isMounted) {
          const frontendUrl = window.location.origin;
          const convertedLinks = shareLinksResponse.data.sharedLinks.map((link: any) => ({
            ...link,
            shareUrl: `${frontendUrl}/shared/${link.shareToken}`
          }));
          setShareLinks(convertedLinks);
        }

      } catch (error: any) {
        if (isMounted) {
          setError('Erro ao carregar favoritos. Tente novamente.');
          console.error('Erro ao carregar dados:', error);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
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
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12 text-text-secondary bg-surface rounded-large border-2 border-dashed border-border">
          <FiHeart size={64} className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-xl mb-2 text-text">Entre para ver seus favoritos</h3>
          <p>Faça login para criar e gerenciar sua lista de filmes favoritos</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center py-12 text-textSecondary">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mb-4"></div>
          <p>Carregando seus favoritos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-error text-white px-6 py-4 rounded-medium text-center mb-6">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full sm:px-4">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-surface to-background px-6 py-8 rounded-large mb-8">
        <div className="flex justify-between items-start gap-6 flex-wrap md:gap-4 sm:gap-2">
          {/* Header Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-text mb-2 flex items-center gap-3 sm:text-3xl sm:gap-2 sm:flex-col sm:items-center sm:text-center">
              <FiHeart size={32} className="w-8 h-8" />
              Meus Favoritos
            </h1>
            <p className="text-textSecondary text-lg mb-4 sm:text-base">
              Lista de filmes favoritos de {username}
            </p>
            <div className="flex gap-6 flex-wrap sm:gap-4">
              <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-medium">
                <FiFilm size={20} className="w-5 h-5" />
                <div>
                  <div className="text-lg font-semibold text-text">{stats.total}</div>
                  <div className="text-sm text-textSecondary">Filmes</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-medium">
                <FiStar size={20} className="w-5 h-5" />
                <div>
                  <div className="text-lg font-semibold text-text">{stats.averageRating.toFixed(1)}</div>
                  <div className="text-sm text-textSecondary">Média</div>
                </div>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex flex-col gap-3 md:flex-row md:gap-2 w-full sm:gap-2">
            <button
              onClick={handleCreateShareLink}
              disabled={isCreatingShareLink || favorites.length === 0}
              className="bg-primary text-white px-4 py-2 rounded-medium font-semibold flex items-center gap-2 hover:bg-red-600 transition-all duration-200 w-full md:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FiShare2 size={18} className="w-4 h-4" />
              {isCreatingShareLink ? 'Criando...' : 'Compartilhar Lista'}
            </button>
            <button
              onClick={handleClearAllFavorites}
              disabled={favorites.length === 0}
              className="bg-error text-white px-4 py-2 rounded-medium font-semibold flex items-center gap-2 hover:bg-red-700 transition-all duration-200 w-full md:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FiTrash2 size={18} className="w-4 h-4" />
              Limpar Tudo
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {favorites.length === 0 ? (
        <div className="text-center py-12 text-textSecondary bg-surface rounded-large border-2 border-dashed border-border">
          <FiHeart size={64} className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-xl mb-2 text-text">Nenhum favorito ainda</h3>
          <p>Explore filmes e adicione seus favoritos para criar sua lista pessoal</p>
        </div>
      ) : (
        <>
          {/* Movies Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-4">
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
          </div>

          {/* Share Links Section */}
          {shareLinks.length > 0 && (
            <div className="mt-8 bg-surface p-4 rounded-medium">
              <h3 className="text-xl font-semibold text-text mb-4">Links Compartilhados</h3>
              {shareLinks.map((link) => (
                <div key={link.shareToken} className="flex flex-col sm:flex-row sm:justify-between items-center p-2 bg-background rounded-small mb-2 last:mb-0 gap-2">
                  <div className="flex-1 min-w-0 sm:mr-4">
                    <div className="text-sm text-textSecondary mb-1">
                      Criado em {formatDate(link.createdAt)}
                      {link.expiresAt && ` • Expira em ${formatDate(link.expiresAt)}`}
                    </div>
                    <div className="font-mono text-xs text-primary break-all">
                      {link.shareUrl}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 sm:flex-shrink-0">
                    <button
                      onClick={() => handleCopyLink(link.shareUrl)}
                      className="bg-primary text-white px-3 py-1 rounded-small font-medium flex items-center gap-1 text-sm hover:bg-red-600 transition-all duration-200 whitespace-nowrap"
                    >
                      <FiCopy size={14} className="w-3.5 h-3.5" />
                      Copiar
                    </button>
                    <button
                      onClick={() => window.open(link.shareUrl, '_blank')}
                      className="bg-background text-text border border-border px-3 py-1 rounded-small font-medium flex items-center gap-1 text-sm hover:bg-surface hover:border-primary transition-all duration-200 whitespace-nowrap"
                    >
                      <FiExternalLink size={14} className="w-3.5 h-3.5" />
                      Visitar
                    </button>
                    <button
                      onClick={() => handleDeleteShareLink(link.shareToken)}
                      className="bg-error text-white px-3 py-1 rounded-small font-medium flex items-center gap-1 text-sm hover:bg-red-700 transition-all duration-200 whitespace-nowrap"
                    >
                      <FiTrash2 size={14} className="w-3.5 h-3.5" />
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Movie Modal */}
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
    </div>
  );
};

export default FavoritesPage;