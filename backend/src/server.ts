import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initTables } from './utils/init-database';
import movieRoutes from './routes/movies';
import favoritesRoutes from './routes/favorites';
import sharedRoutes from './routes/shared';
import authRoutes from './routes/auth';

require('dotenv').config();

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '3001');

// Middleware de segurança
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: 'Muitas requisições feitas deste IP, tente novamente mais tarde.'
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/shared', sharedRoutes);

// Rota de saúde
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Middleware de erro
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Algo deu errado!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor'
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Inicializar tabelas do banco de dados (apenas quando não estiver em teste)
if (process.env.NODE_ENV !== 'test') {
  initTables().then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  }).catch((error: Error) => {
    console.error('Erro ao inicializar o banco de dados:', error);
    process.exit(1);
  });
}

// Exportar app para testes
export default app;