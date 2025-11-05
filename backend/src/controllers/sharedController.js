const User = require('../models/User');
const Favorite = require('../models/Favorite');
const SharedList = require('../models/SharedList');

class SharedController {
  async createShareLink(req, res) {
    try {
      const { username, expiresDays = 30 } = req.body;

      if (!username) {
        return res.status(400).json({ error: 'Nome de usuário é obrigatório' });
      }

      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const shareList = await SharedList.create(user.id, expiresDays);

      res.status(201).json({
        message: 'Link de compartilhamento criado com sucesso!',
        shareToken: shareList.share_token,
        expiresAt: shareList.expires_at,
        shareUrl: `${req.protocol}://${req.get('host')}/api/shared/${shareList.share_token}`
      });
    } catch (error) {
      console.error('Erro ao criar link de compartilhamento:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getSharedList(req, res) {
    try {
      const { shareToken } = req.params;

      if (!shareToken) {
        return res.status(400).json({ error: 'Token de compartilhamento é obrigatório' });
      }

      const shareList = await SharedList.getByToken(shareToken);
      if (!shareList) {
        return res.status(404).json({ error: 'Link de compartilhamento inválido ou expirado' });
      }

      const favorites = await Favorite.getByShareToken(shareToken);

      res.json({
        username: shareList.username,
        createdAt: shareList.created_at,
        expiresAt: shareList.expires_at,
        favorites,
        totalMovies: favorites.length
      });
    } catch (error) {
      console.error('Erro ao buscar lista compartilhada:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getUserSharedLinks(req, res) {
    try {
      const { username } = req.query;

      if (!username) {
        return res.status(400).json({ error: 'Nome de usuário é obrigatório' });
      }

      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const sharedLinks = await SharedList.getByUser(user.id);

      const formattedLinks = sharedLinks.map(link => ({
        shareToken: link.share_token,
        shareUrl: `${req.protocol}://${req.get('host')}/api/shared/${link.share_token}`,
        createdAt: link.created_at,
        expiresAt: link.expires_at,
        isExpired: link.expires_at && new Date(link.expires_at) < new Date()
      }));

      res.json({
        username: user.username,
        sharedLinks: formattedLinks
      });
    } catch (error) {
      console.error('Erro ao buscar links compartilhados:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateShareExpiration(req, res) {
    try {
      const { username, shareToken, expiresDays } = req.body;

      if (!username || !shareToken || !expiresDays) {
        return res.status(400).json({ error: 'Nome de usuário, token e dias de expiração são obrigatórios' });
      }

      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const updatedLink = await SharedList.updateExpiration(shareToken, expiresDays);

      if (!updatedLink) {
        return res.status(404).json({ error: 'Link de compartilhamento não encontrado' });
      }

      res.json({
        message: 'Data de expiração atualizada com sucesso!',
        shareToken: updatedLink.share_token,
        newExpiresAt: updatedLink.expires_at
      });
    } catch (error) {
      console.error('Erro ao atualizar expiração:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async deleteShareLink(req, res) {
    try {
      const { username, shareToken } = req.body;

      if (!username || !shareToken) {
        return res.status(400).json({ error: 'Nome de usuário e token são obrigatórios' });
      }

      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const deletedLink = await SharedList.delete(shareToken, user.id);

      if (!deletedLink) {
        return res.status(404).json({ error: 'Link de compartilhamento não encontrado' });
      }

      res.json({
        message: 'Link de compartilhamento removido com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao deletar link de compartilhamento:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new SharedController();