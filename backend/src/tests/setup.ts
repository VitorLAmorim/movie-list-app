import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { testDb } from '../utils/test-database';

// Mock das variáveis de ambiente
process.env.NODE_ENV = 'test';
process.env.TMDB_API_KEY = 'test_tmdb_api_key';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Mock do serviço TMDB
jest.mock('../services/tmdbService', () => ({
  searchMovies: jest.fn().mockImplementation((query: string) => {
    if (query === 'Batman') {
      return Promise.resolve({
        results: [
          {
            id: 99999,
            title: 'Batman',
            overview: 'A dark knight',
            release_date: '2023-01-01',
            vote_average: 8.5,
            poster_path: '/batman.jpg'
          }
        ],
        total_results: 1,
        total_pages: 1
      });
    }
    return Promise.resolve({
      results: [
        {
          id: 99999,
          title: 'Batman',
          overview: 'A dark knight',
          release_date: '2023-01-01',
          vote_average: 8.5,
          poster_path: '/batman.jpg'
        }
      ],
      total_results: 1,
      total_pages: 1
    });
  }),
  getMovieDetails: jest.fn().mockImplementation((id: number) => {
    if (id === 123) {
      return Promise.resolve({
        id: 123,
        title: 'Batman',
        overview: 'A dark knight',
        release_date: '2023-01-01',
        vote_average: 8.5,
        poster_path: '/batman.jpg'
      });
    }
    return Promise.resolve({
      id: 99999,
      title: 'Batman',
      overview: 'A dark knight',
      release_date: '2023-01-01',
      vote_average: 8.5,
      poster_path: '/batman.jpg'
    });
  }),
  getPopularMovies: jest.fn().mockResolvedValue({
    results: [],
    total_results: 0,
    total_pages: 0
  }),
  getTrendingMovies: jest.fn().mockResolvedValue({
    results: [],
    total_results: 0,
    total_pages: 0
  }),
  formatMovieData: jest.fn((movie) => ({
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    releaseDate: movie.release_date,
    rating: movie.vote_average,
    poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null
  })),
}));

// Mock do UUID com valores dinâmicos para evitar colisões
let uuidCounter = 1000;
jest.mock('uuid', () => ({
  v4: jest.fn(() => `test-share-token-${uuidCounter++}`),
}));

// Mock do banco de dados para usar o banco de testes
jest.mock('../utils/database', () => ({
  query: jest.fn((sql: string, params: any[] = []) => testDb.query(sql, params)),
  get: jest.fn((sql: string, params: any[] = []) => testDb.get(sql, params)),
  run: jest.fn((sql: string, params: any[] = []) => testDb.run(sql, params)),
}));

// Setup global
beforeAll(async () => {
  // Conectar ao banco de dados de testes
  await testDb.connect();
});

afterAll(async () => {
  // Fechar conexão com o banco de dados
  await testDb.close();
});

beforeEach(async () => {
  // Resetar dados antes de cada teste
  await testDb.reset();
});

afterEach(async () => {
  // Limpeza após cada teste (se necessário)
});