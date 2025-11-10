import request from 'supertest';
import app from '../server';

describe('Rotas de Favoritos - Com Banco Real', () => {
  describe('POST /api/favorites/add/:movieId', () => {
    it('deve adicionar filme aos favoritos com sucesso', async () => {
      const movieId = '999';
      const movieData = {
          username: 'testuser',
          movieTitle: 'New Favorite Movie',
          movieOverview: 'A great movie to add to favorites',
          movieReleaseDate: '2023-12-01',
          movieRating: 9.2,
          moviePoster: 'https://example.com/poster999.jpg'
      };

      const response = await request(app)
        .post(`/api/favorites/add/${movieId}`)
        .send(movieData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Filme adicionado aos favoritos com sucesso!');
      expect(response.body).toHaveProperty('favorite');
      expect(response.body.favorite).toHaveProperty('movie_id', parseInt(movieId));
      expect(response.body.favorite).toHaveProperty('movie_title', 'New Favorite Movie');
    });

    it('deve retornar erro para filme já favoritado', async () => {
      // Tentar adicionar o mesmo filme que já está no banco de teste
      const movieId = '123'; // Já existe para testuser
      const movieData = {
        username: 'testuser',
        title: 'Test Movie',
        overview: 'Test overview',
        releaseDate: '2023-01-01',
        rating: 8.5,
        poster: 'https://example.com/poster.jpg'
      };

      const response = await request(app)
        .post(`/api/favorites/add/${movieId}`)
        .send(movieData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('UNIQUE constraint');
    });

    it('deve retornar erro para movieId inválido', async () => {
      const movieData = {
        title: 'Test Movie',
        overview: 'Test overview'
      };

      await request(app)
        .post('/api/favorites/add/invalid')
        .send(movieData)
        .expect(400);

      await request(app)
        .post('/api/favorites/add/0')
        .send(movieData)
        .expect(400);

      await request(app)
        .post('/api/favorites/add/-1')
        .send(movieData)
        .expect(400);
    });

    it('deve retornar erro para dados faltantes', async () => {
      const incompleteData = {
        username: 'testuser',
        title: 'Test Movie'
        // outros campos faltando
      };

      const response = await request(app)
        .post('/api/favorites/add/123')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro para título vazio', async () => {
      const invalidData = {
        username: 'testuser',
        title: '', // título vazio
        overview: 'Test overview',
        releaseDate: '2023-01-01',
        rating: 8.5
      };

      const response = await request(app)
        .post('/api/favorites/add/123')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro para rating inválido', async () => {
      const invalidData = {
        username: 'testuser',
        title: 'Test Movie',
        overview: 'Test overview',
        releaseDate: '2023-01-01',
        rating: 15 // rating acima de 10
      };

      const response = await request(app)
        .post('/api/favorites/add/123')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/favorites/remove', () => {
    it('deve remover filme dos favoritos com sucesso', async () => {
      // Primeiro adicionar um favorito
      const movieId = 888;
      await request(app)
        .post(`/api/favorites/add/${movieId}`)
        .send({
          username: 'testuser',
          title: 'Movie to Remove',
          overview: 'This movie will be removed',
          releaseDate: '2023-11-01',
          rating: 7.5
        })
        .expect(201);

      // Agora remover
      const removeData = {
        username: 'testuser',
        movieId: movieId
      };

      const response = await request(app)
        .delete('/api/favorites/remove')
        .send(removeData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Filme removido dos favoritos com sucesso!');
    });

    it('deve remover favorito existente do banco de teste', async () => {
      const removeData = {
        username: 'testuser',
        movieId: 123 // Existe no banco de teste
      };

      const response = await request(app)
        .delete('/api/favorites/remove')
        .send(removeData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Filme removido dos favoritos com sucesso!');
    });

    it('deve retornar erro para filme não favoritado', async () => {
      const removeData = {
        username: 'testuser',
        movieId: 999999 // Não existe nos favoritos
      };

      const response = await request(app)
        .delete('/api/favorites/remove')
        .send(removeData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Filme não encontrado na lista de favoritos');
    });

    it('deve retornar erro para dados faltantes', async () => {
      const incompleteData = {
        username: 'testuser'
        // movieId faltando
      };

      const response = await request(app)
        .delete('/api/favorites/remove')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro para usuário inválido', async () => {
      const invalidData = {
        username: '', // usuário vazio
        movieId: 123
      };

      const response = await request(app)
        .delete('/api/favorites/remove')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro para movieId inválido', async () => {
      const invalidData = {
        username: 'testuser',
        movieId: 0
      };

      const response = await request(app)
        .delete('/api/favorites/remove')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/favorites/list', () => {
    it('deve retornar lista de favoritos do usuário', async () => {
      const response = await request(app)
        .get('/api/favorites/list')
        .query({ username: 'testuser' })
        .expect(200);

      expect(response.body).toHaveProperty('favorites');
      expect(response.body).toHaveProperty('stats');
      expect(Array.isArray(response.body.favorites)).toBe(true);
      expect(response.body.favorites.length).toBeGreaterThan(0); // testuser tem favoritos no banco
      expect(response.body.stats).toHaveProperty('total');
      expect(response.body.stats).toHaveProperty('averageRating');
    });

    it('deve retornar lista vazia para usuário sem favoritos', async () => {
      const response = await request(app)
        .get('/api/favorites/list')
        .query({ username: 'emptyuser' })
        .expect(200);

      expect(response.body.favorites).toEqual([]);
      expect(response.body.stats.total).toBe(0);
      expect(response.body.stats.averageRating).toBe(0);
    });

    it('deve retornar 404 para usuário inexistente', async () => {
      const response = await request(app)
        .get('/api/favorites/list')
        .query({ username: 'nonexistentuser' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('não encontrado');
    });

    it('deve retornar erro para username ausente', async () => {
      const response = await request(app)
        .get('/api/favorites/list')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro para username vazio', async () => {
      const response = await request(app)
        .get('/api/favorites/list')
        .query({ username: '' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/favorites/check', () => {
    it('deve retornar true para filme que é favorito', async () => {
      const response = await request(app)
        .get('/api/favorites/check')
        .query({ username: 'testuser', movieId: '123' })
        .expect(200);

      expect(response.body).toHaveProperty('isFavorite', true);
    });

    it('deve retornar false para filme que não é favorito', async () => {
      const response = await request(app)
        .get('/api/favorites/check')
        .query({ username: 'testuser', movieId: '999999' })
        .expect(200);

      expect(response.body).toHaveProperty('isFavorite', false);
    });

    it('deve retornar false para usuário inexistente', async () => {
      const response = await request(app)
        .get('/api/favorites/check')
        .query({ username: 'nonexistentuser', movieId: '123' })
        .expect(200);

      expect(response.body).toHaveProperty('isFavorite', false);
    });

    it('deve retornar erro para parâmetros faltantes', async () => {
      await request(app)
        .get('/api/favorites/check')
        .query({ username: 'testuser' }) // movieId faltando
        .expect(400);

      await request(app)
        .get('/api/favorites/check')
        .query({ movieId: '123' }) // username faltando
        .expect(400);

      await request(app)
        .get('/api/favorites/check')
        .expect(400); // ambos faltando
    });

    it('deve retornar erro para parâmetros vazios', async () => {
      await request(app)
        .get('/api/favorites/check')
        .query({ username: '', movieId: '123' })
        .expect(400);

      await request(app)
        .get('/api/favorites/check')
        .query({ username: 'testuser', movieId: '' })
        .expect(400);
    });

    it('deve aceitar movieId válido', async () => {
      // Testar que movieId válido é aceito
      const response = await request(app)
        .get('/api/favorites/check')
        .query({ username: 'testuser', movieId: '123' })
        .expect(200);

      expect(response.body).toHaveProperty('isFavorite');
    });
  });
});