import User from '../models/User';
import { ExpressRequest, ExpressResponse } from '../types';

interface RegisterRequestBody {
  username: string;
  password: string;
}

interface LoginRequestBody {
  username: string;
  password: string;
}

class AuthController {
  async register(req: ExpressRequest<RegisterRequestBody>, res: ExpressResponse): Promise<void> {
    try {
      const { username, password } = req.body;

      // Validações
      if (!username || !password) {
        res.status(400).json({
          error: 'Nome de usuário e senha são obrigatórios'
        });
        return;
      }

      if (username.length < 3) {
        res.status(400).json({
          error: 'Nome de usuário deve ter pelo menos 3 caracteres'
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          error: 'Senha deve ter pelo menos 6 caracteres'
        });
        return;
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        res.status(400).json({
          error: 'Nome de usuário deve conter apenas letras, números e underscores'
        });
        return;
      }

      // Criar usuário
      const user = await User.create(username, password);

      res.status(201).json({
        message: 'Usuário criado com sucesso!',
        user: {
          id: user.id,
          username: user.username,
          created_at: user.created_at
        }
      });
    } catch (error: any) {
      console.error('Erro ao registrar usuário:', error);
      res.status(400).json({
        error: error.message || 'Erro ao criar usuário'
      });
    }
  }

  async login(req: ExpressRequest<LoginRequestBody>, res: ExpressResponse): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username) {
        res.status(400).json({
          error: 'Nome de usuário é obrigatório'
        });
        return;
      }

      // Autenticar usuário
      const user = await User.authenticate(username, password || '');

      if (!user) {
        res.status(401).json({
          error: 'Nome de usuário ou senha incorretos'
        });
        return;
      }

      // Verificar se o usuário precisa definir uma senha (compatibilidade)
      const needsPassword = !user.password_hash || user.password_hash === '';

      res.json({
        message: 'Login realizado com sucesso!',
        user: {
          id: user.id,
          username: user.username,
          created_at: user.created_at,
          needsPassword
        }
      });
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      res.status(500).json({
        error: 'Erro ao fazer login'
      });
    }
  }

  async setPassword(req: ExpressRequest<{ userId: number; password: string }>, res: ExpressResponse): Promise<void> {
    try {
      const { userId, password } = req.body;

      if (!userId || !password) {
        res.status(400).json({
          error: 'ID do usuário e senha são obrigatórios'
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          error: 'Senha deve ter pelo menos 6 caracteres'
        });
        return;
      }

      await User.setPassword(userId, password);

      res.json({
        message: 'Senha definida com sucesso!'
      });
    } catch (error: any) {
      console.error('Erro ao definir senha:', error);
      res.status(400).json({
        error: error.message || 'Erro ao definir senha'
      });
    }
  }
}

export default new AuthController();