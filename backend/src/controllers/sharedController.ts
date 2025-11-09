import User from '../models/User';
import Favorite from '../models/Favorite';
import SharedList from '../models/SharedList';
import { ExpressRequest, ExpressResponse } from '../types';
import { Request } from 'express';

interface CreateShareLinkRequestBody {
  username: string;
  expiresDays?: number;
}

interface GetSharedListParams {
  shareToken: string;
}

interface GetUserSharedLinksQuery {
  username: string;
}

interface UpdateShareExpirationRequestBody {
  username: string;
  shareToken: string;
  expiresDays: number;
}

interface DeleteShareLinkRequestBody {
  username: string;
  shareToken: string;
}

class SharedController {
  async createShareLink(req: ExpressRequest<CreateShareLinkRequestBody> & Request, res: ExpressResponse): Promise<void> {
    try {
      const { username, expiresDays = 30 } = req.body;

      if (!username) {
        res.status(400).json({ error: 'Nome de usuário é obrigatório' });
        return;
      }

      const user = await User.findByUsername(username);
      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      const shareList = await SharedList.create(user.id, expiresDays);

      const host = req.get('host');
      const protocol = req.protocol;

      res.status(201).json({
        message: 'Link de compartilhamento criado com sucesso!',
        shareToken: shareList.share_token,
        expiresAt: shareList.expires_at,
        shareUrl: `${protocol}://${host}/api/shared/${shareList.share_token}`
      });
    } catch (error: any) {
      console.error('Erro ao criar link de compartilhamento:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getSharedList(req: ExpressRequest<any, any, GetSharedListParams>, res: ExpressResponse): Promise<void> {
    try {
      const { shareToken } = req.params;

      if (!shareToken) {
        res.status(400).json({ error: 'Token de compartilhamento é obrigatório' });
        return;
      }

      const shareList = await SharedList.getByToken(shareToken);
      if (!shareList) {
        res.status(404).json({ error: 'Link de compartilhamento inválido ou expirado' });
        return;
      }

      const favorites = await Favorite.getByShareToken(shareToken);

        const processedFavorites = favorites.map(fav => ({
            ...fav,
            movie_rating: parseFloat(String(fav.movie_rating)) || 0
        }));

      res.json({
          username: shareList.username,
          createdAt: shareList.created_at,
          expiresAt: shareList.expires_at,
          favorites: processedFavorites,
          totalMovies: processedFavorites.length
      });
    } catch (error: any) {
      console.error('Erro ao buscar lista compartilhada:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getUserSharedLinks(req: ExpressRequest<any, GetUserSharedLinksQuery> & Request, res: ExpressResponse): Promise<void> {
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

      const sharedLinks = await SharedList.getByUser(user.id);

      const host = req.get('host');
      const protocol = req.protocol;

      const formattedLinks = sharedLinks.map(link => ({
        shareToken: link.share_token,
        shareUrl: `${protocol}://${host}/api/shared/${link.share_token}`,
        createdAt: link.created_at,
        expiresAt: link.expires_at,
        isExpired: link.expires_at && new Date(link.expires_at) < new Date()
      }));

      res.json({
        username: user.username,
        sharedLinks: formattedLinks
      });
    } catch (error: any) {
      console.error('Erro ao buscar links compartilhados:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateShareExpiration(req: ExpressRequest<UpdateShareExpirationRequestBody>, res: ExpressResponse): Promise<void> {
    try {
      const { username, shareToken, expiresDays } = req.body;

      if (!username || !shareToken || !expiresDays) {
        res.status(400).json({ error: 'Nome de usuário, token e dias de expiração são obrigatórios' });
        return;
      }

      const user = await User.findByUsername(username);
      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      const updatedLink = await SharedList.updateExpiration(shareToken, expiresDays);

      if (!updatedLink) {
        res.status(404).json({ error: 'Link de compartilhamento não encontrado' });
        return;
      }

      res.json({
        message: 'Data de expiração atualizada com sucesso!',
        shareToken: updatedLink.share_token,
        newExpiresAt: updatedLink.expires_at
      });
    } catch (error: any) {
      console.error('Erro ao atualizar expiração:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async deleteShareLink(req: ExpressRequest<DeleteShareLinkRequestBody>, res: ExpressResponse): Promise<void> {
    try {
      const { username, shareToken } = req.body;

      if (!username || !shareToken) {
        res.status(400).json({ error: 'Nome de usuário e token são obrigatórios' });
        return;
      }

      const user = await User.findByUsername(username);
      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      const deletedLink = await SharedList.delete(shareToken, user.id);

      if (!deletedLink) {
        res.status(404).json({ error: 'Link de compartilhamento não encontrado' });
        return;
      }

      res.json({
        message: 'Link de compartilhamento removido com sucesso!'
      });
    } catch (error: any) {
      console.error('Erro ao deletar link de compartilhamento:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new SharedController();
