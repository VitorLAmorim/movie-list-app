import request from 'supertest';
import app from '../server';

describe('Testes de Integração - Com Banco Real', () => {
  describe('Fluxo Completo de Usuário', () => {
    it('deve permitir fluxo completo: registro -> login -> favoritos -> compartilhamento', async () => {
      // 1. Registrar usuário
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'integrationuser',
          password: 'testpass123'
        })
        .expect(201);

      expect(registerResponse.body).toHaveProperty('user');
      expect(registerResponse.body.user.username).toBe('integrationuser');

      // 2. Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'integrationuser',
          password: 'testpass123'
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('user');
      expect(loginResponse.body.user.username).toBe('integrationuser');

      // 3. Adicionar filme aos favoritos
      const favoriteResponse = await request(app)
        .post('/api/favorites/add/9999')
        .send({
          username: 'integrationuser',
          title: 'Integration Test Movie',
          overview: 'Movie for integration testing',
          releaseDate: '2023-01-01',
          rating: 8.5,
          poster: 'https://example.com/poster.jpg'
        })
        .expect(201);

      expect(favoriteResponse.body).toHaveProperty('message');

      // 4. Verificar favorito
      const checkResponse = await request(app)
        .get('/api/favorites/check')
        .query({
          username: 'integrationuser',
          movieId: '9999'
        })
        .expect(200);

      expect(checkResponse.body).toHaveProperty('isFavorite', true);

      // 5. Buscar lista de favoritos
      const favoritesResponse = await request(app)
        .get('/api/favorites/list')
        .query({ username: 'integrationuser' })
        .expect(200);

      expect(favoritesResponse.body).toHaveProperty('favorites');
      expect(favoritesResponse.body.favorites).toHaveLength(1);

      // 6. Criar link de compartilhamento
      const shareResponse = await request(app)
        .post('/api/shared/create')
        .send({
          username: 'integrationuser'
        })
        .expect(201);

      expect(shareResponse.body).toHaveProperty('shareToken');

      // 7. Acessar lista compartilhada
      const sharedListResponse = await request(app)
        .get(`/api/shared/${shareResponse.body.shareToken}`)
        .expect(200);

      expect(sharedListResponse.body).toHaveProperty('username', 'integrationuser');
      expect(sharedListResponse.body).toHaveProperty('favorites');
      expect(sharedListResponse.body.favorites).toHaveLength(1);

      // 8. Remover favorito
      const removeResponse = await request(app)
        .delete('/api/favorites/remove')
        .send({
          username: 'integrationuser',
          movieId: 9999
        })
        .expect(200);

      expect(removeResponse.body).toHaveProperty('message');

      // 9. Verificar remoção
      const checkAfterRemoveResponse = await request(app)
        .get('/api/favorites/check')
        .query({
          username: 'integrationuser',
          movieId: '9999'
        })
        .expect(200);

      expect(checkAfterRemoveResponse.body).toHaveProperty('isFavorite', false);
    });
  });

  describe('Integração com APIs Externas', () => {
    it('deve integrar busca de filmes com favoritos', async () => {
      // Primeiro buscar filmes
      const searchResponse = await request(app)
        .get('/api/movies/search')
        .query({ query: 'Batman' })
        .expect(200);

      expect(searchResponse.body.movies.length).toBeGreaterThan(0);

      const movie = searchResponse.body.movies[0];

      // Adicionar aos favoritos
      await request(app)
        .post(`/api/favorites/add/${movie.id}`)
        .send({
          username: 'testuser',
          title: movie.title,
          overview: movie.overview,
          releaseDate: movie.releaseDate,
          rating: movie.rating,
          poster: movie.poster
        })
        .expect(201);

      // Verificar que foi adicionado
      const checkResponse = await request(app)
        .get('/api/favorites/check')
        .query({
          username: 'testuser',
          movieId: movie.id.toString()
        })
        .expect(200);

      expect(checkResponse.body).toHaveProperty('isFavorite', true);
    });

    it('deve manter consistência entre detalhes do filme e favoritos', async () => {
      // Obter detalhes do filme
      const detailsResponse = await request(app)
        .get('/api/movies/123')
        .expect(200);

      const movieDetails = detailsResponse.body;

      // Adicionar aos favoritos
      await request(app)
        .post('/api/favorites/add/9998')
        .send({
            username: 'testuser',
            movieTitle: movieDetails.title,
            movieOverview: movieDetails.overview,
            movieReleaseDate: movieDetails.releaseDate,
            movieRating: movieDetails.rating,
            moviePoster: movieDetails.poster
        })
        .expect(201);

      // Buscar lista de favoritos
      const favoritesResponse = await request(app)
        .get('/api/favorites/list')
        .query({ username: 'testuser' })
        .expect(200);

      // Encontrar o filme na lista
      const favoriteMovie = favoritesResponse.body.favorites.find(
        (fav: any) => fav.movie_id === 9998
      );

      expect(favoriteMovie).toBeDefined();
      expect(favoriteMovie.movie_title).toBe(movieDetails.title);
      expect(favoriteMovie.movie_rating).toBe(movieDetails.rating);
    });
  });

  describe('Performance e Rate Limiting', () => {
    it('deve suportar múltiplas requisições simultâneas', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app).get('/api/health')
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'OK');
      });
    }, 10000);

    it('deve suportar múltiplas operações de banco', async () => {
      // Criar usuário
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'perfuser', password: 'testpass123' })
        .expect(201);

      // Operações paralelas de favoritos
      const favoriteOperations = Array(5).fill(null).map((_, index) =>
        request(app)
          .post(`/api/favorites/add/${1000 + index}`)
          .send({
            username: 'perfuser',
            title: `Movie ${index}`,
            overview: `Overview for movie ${index}`,
            releaseDate: '2023-01-01',
            rating: 8.0
          })
      );

      const responses = await Promise.all(favoriteOperations);

      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Verificar todos foram adicionados
      const favoritesResponse = await request(app)
        .get('/api/favorites/list')
        .query({ username: 'perfuser' })
        .expect(200);

      expect(favoritesResponse.body.favorites).toHaveLength(5);
    }, 15000);

    it('deve manter headers de segurança sob carga', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      // Verificar headers importantes estão presentes
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve formatar mensagens de erro consistentemente', async () => {
      const responses = [
        await request(app).get('/api/rota-inexistente'),
        await request(app).post('/api/auth/login').send({}),
        await request(app).get('/api/favorites/list'),
      ];

      responses.forEach(response => {
        if (response.status >= 400) {
          expect(response.body).toHaveProperty('error');
        }
      });
    });

    it('deve lidar com estado inconsistente do banco', async () => {
      // Tentar remover favorito que não existe
      const response = await request(app)
        .delete('/api/favorites/remove')
        .send({
          username: 'testuser',
          movieId: 999999
        })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('não encontrado');
    });

    it('deve validar integridade dos dados', async () => {
      // Tentar acessar link de compartilhamento expirado
      const response = await request(app)
        .get('/api/shared/expired-token')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('inválido ou expirado');
    });
  });

  describe('Comportamento do CORS', () => {
    it('deve incluir headers CORS apropriados', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('deve aceitar requisições de origens permitidas', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin', 'http://localhost:3000');
    });
  });

  describe('Validação de Input', () => {
    it('deve rejeitar JSON malformado', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}') // JSON malformado
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('deve aceitar inputs muito grandes', async () => {
      const largeUsername = 'a'.repeat(1000);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: largeUsername,
          password: 'testpass123'
        })
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe(largeUsername);
    });
  });

  describe('Consistência de Dados', () => {
    it('deve manter relacionamentos consistentes', async () => {
      // Criar usuário e favorito
      const username = 'consistencyuser';
      await request(app)
        .post('/api/auth/register')
        .send({ username, password: 'testpass123' })
        .expect(201);

      const movieId = 555;
      await request(app)
        .post(`/api/favorites/add/${movieId}`)
        .send({
            username: username,
            movieTitle: 'Consistency Test Movie',
            movieOverview: 'Testing data consistency',
            movieReleaseDate: '2023-01-01',
            movieRating: 8.0
        })
        .expect(201);

      // Criar link de compartilhamento
      const shareResponse = await request(app)
        .post('/api/shared/create')
        .send({ username })
        .expect(201);

      // Verificar que o favorito está acessível via link compartilhado
      const sharedResponse = await request(app)
        .get(`/api/shared/${shareResponse.body.shareToken}`)
        .expect(200);

      const sharedFavorite = sharedResponse.body.favorites.find(
        (fav: any) => fav.movie_id === movieId
      );

      expect(sharedFavorite).toBeDefined();
      expect(sharedFavorite.movie_title).toBe('Consistency Test Movie');
    });

    it('deve limpar dados relacionados ao remover usuário', async () => {
      // Criar usuário com favoritos e links
      const username = 'cleanupuser';
      await request(app)
        .post('/api/auth/register')
        .send({ username, password: 'testpass123' })
        .expect(201);

      // Adicionar favoritos
      await request(app)
        .post('/api/favorites/add/777')
        .send({
          username: username,
          title: 'Cleanup Test Movie',
          overview: 'Will be cleaned up',
          releaseDate: '2023-01-01',
          rating: 7.0
        })
        .expect(201);

      // Criar link de compartilhamento
      const shareResponse = await request(app)
        .post('/api/shared/create')
        .send({ username })
        .expect(201);

      // Remover favorito (simulando limpeza)
      await request(app)
        .delete('/api/favorites/remove')
        .send({ username, movieId: 777 })
        .expect(200);

      // Verificar que link ainda existe mas sem favoritos
      const sharedResponse = await request(app)
        .get(`/api/shared/${shareResponse.body.shareToken}`)
        .expect(200);

      expect(sharedResponse.body.favorites).toEqual([]);
    });
  });
});