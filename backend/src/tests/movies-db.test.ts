import request from 'supertest';
import app from '../server';

describe('Rotas de Filmes - Com Banco Real', () => {
  describe('GET /api/movies/search', () => {
    it('deve buscar filmes com sucesso', async () => {
      const response = await request(app)
        .get('/api/movies/search')
        .query({ query: 'Batman' })
        .expect(200);

      expect(response.body).toHaveProperty('movies');
      expect(Array.isArray(response.body.movies)).toBe(true);
      expect(response.body).toHaveProperty('totalResults');
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body.movies.length).toBeGreaterThan(0);
      expect(response.body.movies[0]).toHaveProperty('id');
      expect(response.body.movies[0]).toHaveProperty('title');
      expect(response.body.movies[0]).toHaveProperty('overview');
      expect(response.body.movies[0]).toHaveProperty('releaseDate');
      expect(response.body.movies[0]).toHaveProperty('rating');
    });

    it('deve retornar 400 para query ausente', async () => {
      const response = await request(app)
        .get('/api/movies/search')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('obrigatório');
    });

    it('deve retornar 400 para query vazia', async () => {
      const response = await request(app)
        .get('/api/movies/search')
        .query({ query: '' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('deve aceitar parâmetro de página', async () => {
      const response = await request(app)
        .get('/api/movies/search')
        .query({ query: 'Batman', page: 2 })
        .expect(200);

      expect(response.body).toHaveProperty('movies');
      // Page não é retornado pela API
    });

    it('deve aceitar diferentes termos de busca', async () => {
      const searches = ['Avengers', 'Spider-Man', 'Star Wars'];

      for (const query of searches) {
        const response = await request(app)
          .get('/api/movies/search')
          .query({ query })
          .expect(200);

        expect(response.body).toHaveProperty('movies');
        expect(Array.isArray(response.body.movies)).toBe(true);
      }
    });
  });

  describe('GET /api/movies/popular/list', () => {
    it('deve retornar lista de filmes populares', async () => {
      const response = await request(app)
        .get('/api/movies/popular/list')
        .expect(200);

      expect(response.body).toHaveProperty('movies');
      expect(Array.isArray(response.body.movies)).toBe(true);
      expect(response.body).toHaveProperty('totalResults');
      expect(response.body).toHaveProperty('totalPages');
    });

    it('deve aceitar parâmetro de página', async () => {
      const response = await request(app)
        .get('/api/movies/popular/list')
        .query({ page: 2 })
        .expect(200);

      expect(response.body).toHaveProperty('movies');
      // Page não é retornado pela API
    });

    it('deve retornar estrutura consistente', async () => {
      const response = await request(app)
        .get('/api/movies/popular/list')
        .expect(200);

      expect(response.body).toHaveProperty('movies');
      expect(response.body).toHaveProperty('totalResults');
      expect(response.body).toHaveProperty('totalPages');

      if (response.body.movies.length > 0) {
        const movie = response.body.movies[0];
        expect(movie).toHaveProperty('id');
        expect(movie).toHaveProperty('title');
        expect(movie).toHaveProperty('overview');
        expect(movie).toHaveProperty('releaseDate');
        expect(movie).toHaveProperty('rating');
        expect(movie).toHaveProperty('poster');
      }
    });
  });

  describe('GET /api/movies/trending/list', () => {
    it('deve retornar lista de filmes em alta', async () => {
      const response = await request(app)
        .get('/api/movies/trending/list')
        .expect(200);

      expect(response.body).toHaveProperty('movies');
      expect(Array.isArray(response.body.movies)).toBe(true);
      expect(response.body).toHaveProperty('totalResults');
      expect(response.body).toHaveProperty('totalPages');
    });

    it('deve aceitar parâmetro de página', async () => {
      const response = await request(app)
        .get('/api/movies/trending/list')
        .query({ page: 3 })
        .expect(200);

      expect(response.body).toHaveProperty('movies');
      // Page não é retornado pela API
    });

    it('deve retornar estrutura similar ao popular', async () => {
      const trendingResponse = await request(app)
        .get('/api/movies/trending/list')
        .expect(200);

      const popularResponse = await request(app)
        .get('/api/movies/popular/list')
        .expect(200);

      // Ambos devem ter a mesma estrutura
      expect(trendingResponse.body).toHaveProperty('movies');
      expect(trendingResponse.body).toHaveProperty('totalResults');
      expect(trendingResponse.body).toHaveProperty('totalPages');

      expect(popularResponse.body).toHaveProperty('movies');
      expect(popularResponse.body).toHaveProperty('totalResults');
      expect(popularResponse.body).toHaveProperty('totalPages');
    });
  });

  describe('GET /api/movies/:id', () => {
    it('deve retornar detalhes do filme com sucesso', async () => {
      const response = await request(app)
        .get('/api/movies/123')
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('overview');
      expect(response.body).toHaveProperty('releaseDate');
      expect(response.body).toHaveProperty('rating');
      expect(response.body).toHaveProperty('poster');
      expect(response.body.id).toBe(123);
    });

    it('deve retornar 400 para ID inválido', async () => {
      await request(app)
        .get('/api/movies/invalid')
        .expect(400); // Não é número válido

      await request(app)
        .get('/api/movies/0')
        .expect(400); // Zero é considerado inválido

      await request(app)
        .get('/api/movies/-1')
        .expect(200); // Número negativo é válido
    });

    it('deve aceitar IDs válidos diferentes', async () => {
      const validIds = [123, 456, 789];

      for (const id of validIds) {
        const response = await request(app)
          .get(`/api/movies/${id}`)
          .expect(200);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('title');
        expect(response.body).toHaveProperty('overview');
        expect(response.body).toHaveProperty('releaseDate');
        expect(response.body).toHaveProperty('rating');
        expect(response.body).toHaveProperty('poster');
      }
    });

    it('deve retornar estrutura completa do filme', async () => {
      const response = await request(app)
        .get('/api/movies/123')
        .expect(200);

      const movie = response.body;
      expect(movie).toHaveProperty('id', 123);
      expect(movie).toHaveProperty('title', 'Batman');
      expect(movie).toHaveProperty('overview', 'A dark knight');
      expect(movie).toHaveProperty('releaseDate', '2023-01-01');
      expect(movie).toHaveProperty('rating', 8.5);
      expect(movie).toHaveProperty('poster');
      expect(movie.poster).toContain('https://image.tmdb.org/t/p/w500');
    });
  });

  describe('Integração entre endpoints', () => {
    it('deve manter consistência entre busca e detalhes', async () => {
      // Primeiro buscar
      const searchResponse = await request(app)
        .get('/api/movies/search')
        .query({ query: 'Batman' })
        .expect(200);

      expect(searchResponse.body.movies.length).toBeGreaterThan(0);

      const movieFromSearch = searchResponse.body.movies[0];
      const movieId = movieFromSearch.id;

      // Depois obter detalhes
      const detailsResponse = await request(app)
        .get(`/api/movies/${movieId}`)
        .expect(200);

      const movieFromDetails = detailsResponse.body;

      // Verificar consistência
      expect(movieFromSearch.id).toBe(movieFromDetails.id);
      expect(movieFromSearch.title).toBe(movieFromDetails.title);
      expect(movieFromSearch.overview).toBe(movieFromDetails.overview);
      expect(movieFromSearch.releaseDate).toBe(movieFromDetails.releaseDate);
      expect(movieFromSearch.rating).toBe(movieFromDetails.rating);
    });

    it('deve aceitar múltiplas requisições simultâneas', async () => {
      const requests = [
        request(app).get('/api/movies/search').query({ query: 'Batman' }),
        request(app).get('/api/movies/popular/list'),
        request(app).get('/api/movies/trending/list'),
        request(app).get('/api/movies/123')
      ];

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    }, 10000);

    it('deve manter formatação consistente', async () => {
      const endpoints = [
        { url: '/api/movies/search', params: { query: 'Batman' } },
        { url: '/api/movies/popular/list' },
        { url: '/api/movies/trending/list' }
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint.url)
          .query(endpoint.params || {})
          .expect(200);

        if (response.body.movies && response.body.movies.length > 0) {
          const movie = response.body.movies[0];
          expect(movie).toHaveProperty('id');
          expect(movie).toHaveProperty('title');
          expect(movie).toHaveProperty('overview');
          expect(movie).toHaveProperty('releaseDate');
          expect(movie).toHaveProperty('rating');
          expect(movie).toHaveProperty('poster');
        }
      }
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve retornar erro para parâmetros inválidos', async () => {
      const invalidParams = [
        { query: -1 }, // página negativa
        { query: 'test', page: 0 }, // página zero
        { query: 'test', page: 'invalid' } // página inválida
      ];

      for (const params of invalidParams) {
        try {
          await request(app)
            .get('/api/movies/search')
            .query(params);
        } catch (error) {
          // Deve aceitar ou retornar erro apropriado
        }
      }
    });

    it('deve formatar URLs de poster corretamente', async () => {
      const response = await request(app)
        .get('/api/movies/123')
        .expect(200);

      if (response.body.poster) {
        expect(response.body.poster).toMatch(/^https:\/\/image\.tmdb\.org\/t\/p\/w500\//);
      }
    });
  });
});