import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiHeart, FiCalendar, FiStar, FiUser, FiExternalLink, FiShare2, FiAlertCircle } from 'react-icons/fi';
import MovieCard from '../components/MovieCard';
import MovieModal from '../components/MovieModal';
import { sharedAPI } from '../services/api';

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
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center py-16 text-textSecondary">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mb-6"></div>
          <p>Carregando lista compartilhada...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-error text-white px-8 py-8 rounded-large text-center max-w-lg mx-auto">
          <h3 className="text-[1.5rem] mb-4 flex items-center justify-center gap-2">
            <FiAlertCircle size={24} />
            Link Inválido
          </h3>
          <p className="mb-6">{error}</p>
          <Link
            to="/"
            className="inline-block bg-primary text-text border border-primary px-6 py-3 rounded-medium font-semibold cursor-pointer flex items-center gap-2 transition-all duration-200 hover:bg-red-600 hover:transform hover:translate-y-[-2px] text-decoration-none text-center"
          >
            Voltar para Página Inicial
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-gradient-to-br from-surface to-background px-8 py-8 rounded-large mb-8 text-center">
        <div className="bg-gradient-to-br from-primary to-accent w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiShare2 size={40} color="white" />
        </div>
        <h1 className="text-[2.5rem] font-bold text-text mb-2 sm:text-[2rem]">
          Lista Compartilhada
        </h1>
        <div className="flex items-center justify-center gap-2 text-[1.3rem] text-primary mb-4">
          <FiUser size={20} />
          {sharedList.username}
        </div>

        <div className="flex justify-center gap-8 mb-6 flex-wrap">
          <div className="flex items-center gap-2 text-textSecondary">
            <FiHeart size={18} />
            {sharedList.totalMovies} filmes
          </div>
          <div className="flex items-center gap-2 text-textSecondary">
            <FiStar size={18} />
            {calculateAverageRating(sharedList.favorites)} média
          </div>
          <div className="flex items-center gap-2 text-textSecondary">
            <FiCalendar size={18} />
            Criada em {formatDate(sharedList.createdAt)}
          </div>
        </div>

        <div className="bg-background px-4 py-3 rounded-medium text-textSecondary text-sm mb-6">
          {sharedList.expiresAt ? (
            <span>Este link expira em {formatDate(sharedList.expiresAt)}</span>
          ) : (
            <span>Este link não expira</span>
          )}
        </div>

        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            to="/"
            className="bg-primary text-text border border-primary px-6 py-3 rounded-medium font-semibold cursor-pointer flex items-center gap-2 transition-all duration-200 hover:bg-red-600 hover:transform hover:translate-y-[-2px] text-decoration-none text-center"
          >
            Criar Sua Própria Lista
          </Link>
          <button
            onClick={handleShareLink}
            className="bg-background text-text border border-border px-6 py-3 rounded-medium font-semibold cursor-pointer flex items-center gap-2 transition-all duration-200 hover:bg-surface hover:transform hover:translate-y-[-2px] text-center"
          >
            <FiExternalLink size={18} />
            Compartilhar Link
          </button>
        </div>
      </div>

      {sharedList.favorites.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-large border-2 border-dashed border-border">
          <h3 className="text-[1.5rem] mb-2 text-text flex items-center justify-center gap-2">
            <FiHeart size={32} />
            Lista Vazia
          </h3>
          <p className="text-textSecondary mb-6">{sharedList.username} ainda não adicionou nenhum filme à sua lista de favoritos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-4">
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
        </div>
      )}

      <MovieModal
        movie={selectedMovie}
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
};

export default SharedListPage;