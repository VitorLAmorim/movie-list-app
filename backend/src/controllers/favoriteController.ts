import User from '../models/User';
import Favorite from '../models/Favorite';
import { ExpressRequest, ExpressResponse } from '../types';
import { Request } from 'express';

interface AddFavoriteRequestBody {
  username: string;
  movieData?: {
    id: number;
    title: string;
    poster: string | null;
    rating: number;
    releaseDate: string | null;
    overview: string;
  };
  movieTitle?: string;
  moviePoster?: string | null;
  movieRating?: string;
  movieReleaseDate?: string | null;
  movieOverview?: string;
}

interface RemoveFavoriteRequestBody {
  username: string;
  movieId: number;
}

interface CheckFavoriteQuery {
  username: string;
  movieId: string;
}

interface GetFavoritesQuery {
  username: string;
}

interface AddFavoriteParams {
  movieId: string;
}

class FavoriteController {
  async addFavorite(req: ExpressRequest<AddFavoriteRequestBody> & { params: AddFavoriteParams }, res: ExpressResponse): Promise<void> {
    try {
      const { username } = req.body;
      const { movieId } = req.params;

      if (!username || !movieId) {
        res.status(400).json({ error: 'Nome de usuário e ID do filme são obrigatórios' });
        return;
      }

      // Buscar usuário
      const user = await User.findByUsername(username);
      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      const movieData = req.body.movieData || {
          id: parseInt(movieId),
          title: req.body.movieTitle || 'Filme sem título',
          poster: req.body.moviePoster || null,
          rating: parseFloat(req.body.movieRating || '0') || 0,
          releaseDate: req.body.movieReleaseDate || null,
          overview: req.body.movieOverview || ''
      };

      const favorite = await Favorite.add(user.id, movieData);

      // Converter rating para número na resposta
      const processedFavorite = {
        ...favorite,
        movie_rating: parseFloat(String(favorite.movie_rating)) || 0
      };

      res.status(201).json({
        message: 'Filme adicionado aos favoritos com sucesso!',
        favorite: processedFavorite
      });
    } catch (error: any) {
      console.error('Erro ao adicionar favorito:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async removeFavorite(req: ExpressRequest<RemoveFavoriteRequestBody>, res: ExpressResponse): Promise<void> {
    try {
      const { username, movieId } = req.body;

      if (!username || !movieId) {
        res.status(400).json({ error: 'Nome de usuário e ID do filme são obrigatórios' });
        return;
      }

      const user = await User.findByUsername(username);
      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      const removedFavorite = await Favorite.remove(user.id, movieId);

      if (!removedFavorite) {
        res.status(404).json({ error: 'Filme não encontrado na lista de favoritos' });
        return;
      }

      res.json({
        message: 'Filme removido dos favoritos com sucesso!',
        favorite: removedFavorite
      });
    } catch (error: any) {
      console.error('Erro ao remover favorito:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getFavorites(req: ExpressRequest<any, GetFavoritesQuery>, res: ExpressResponse): Promise<void> {
    try {
      const { username } = req.query;

      if (!username) {
        res.status(400).json({ error: 'Nome de usuário é obrigatório' });
        return;
      }

      const user = await User.findByUsername(username);
      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      const favorites = await Favorite.getByUser(user.id);
      const stats = await Favorite.getStats(user.id);

      const processedFavorites = favorites.map(fav => ({
        ...fav,
        movie_rating: parseFloat(String(fav.movie_rating)) || 0
      }));

      res.json({
        username: user.username,
        favorites: processedFavorites,
        stats: {
          total: parseInt(String(stats.total_count)),
          averageRating: parseFloat(String(stats.avg_rating)) || 0
        }
      });
    } catch (error: any) {
      console.error('Erro ao buscar favoritos:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async checkFavorite(req: ExpressRequest<any, CheckFavoriteQuery>, res: ExpressResponse): Promise<void> {
    try {
      const { username, movieId } = req.query;

      if (!username || !movieId) {
        res.status(400).json({ error: 'Nome de usuário e ID do filme são obrigatórios' });
        return;
      }

      const user = await User.findByUsername(username);
      if (!user) {
        res.json({ isFavorite: false });
        return;
      }

      const favorite = await Favorite.checkFavorite(user.id, parseInt(movieId));

      res.json({
        isFavorite: !!favorite,
        addedAt: favorite?.added_at
      });
    } catch (error: any) {
      console.error('Erro ao verificar favorito:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new FavoriteController();
