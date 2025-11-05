const User = require('../models/User');
const Favorite = require('../models/Favorite');

class FavoriteController {
  async addFavorite(req, res) {
    try {
      const { username } = req.body;
      const { movieId } = req.params;

      if (!username || !movieId) {
        return res.status(400).json({ error: 'Nome de usuário e ID do filme são obrigatórios' });
      }

      // Buscar ou criar usuário
      let user = await User.findByUsername(username);
      if (!user) {
        user = await User.create(username);
      }

      // Buscar detalhes do filme (isso seria feito através de um serviço)
      // Por simplicidade, vamos receber os dados do filme no corpo da requisição
      const movieData = req.body.movieData || {
        id: movieId,
        title: req.body.movieTitle || 'Filme sem título',
        poster: req.body.moviePoster || null,
        rating: req.body.movieRating || 0,
        releaseDate: req.body.movieReleaseDate || null,
        overview: req.body.movieOverview || ''
      };

      const favorite = await Favorite.add(user.id, movieData);

      res.status(201).json({
        message: 'Filme adicionado aos favoritos com sucesso!',
        favorite
      });
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async removeFavorite(req, res) {
    try {
      const { username, movieId } = req.body;

      if (!username || !movieId) {
        return res.status(400).json({ error: 'Nome de usuário e ID do filme são obrigatórios' });
      }

      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const removedFavorite = await Favorite.remove(user.id, movieId);

      if (!removedFavorite) {
        return res.status(404).json({ error: 'Filme não encontrado na lista de favoritos' });
      }

      res.json({
        message: 'Filme removido dos favoritos com sucesso!',
        favorite: removedFavorite
      });
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getFavorites(req, res) {
    try {
      const { username } = req.query;

      if (!username) {
        return res.status(400).json({ error: 'Nome de usuário é obrigatório' });
      }

      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const favorites = await Favorite.getByUser(user.id);
      const stats = await Favorite.getStats(user.id);

      res.json({
        username: user.username,
        favorites,
        stats: {
          total: parseInt(stats.total_count),
          averageRating: parseFloat(stats.avg_rating) || 0
        }
      });
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async checkFavorite(req, res) {
    try {
      const { username, movieId } = req.query;

      if (!username || !movieId) {
        return res.status(400).json({ error: 'Nome de usuário e ID do filme são obrigatórios' });
      }

      const user = await User.findByUsername(username);
      if (!user) {
        return res.json({ isFavorite: false });
      }

      const favorite = await Favorite.checkFavorite(user.id, movieId);

      res.json({
        isFavorite: !!favorite,
        addedAt: favorite?.added_at
      });
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new FavoriteController();