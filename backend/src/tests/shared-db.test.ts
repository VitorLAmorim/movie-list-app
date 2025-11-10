import request from 'supertest';
import app from '../server';

describe('Rotas de Compartilhamento - Com Banco Real', () => {
  describe('POST /api/shared/create', () => {
    it('deve criar link de compartilhamento com sucesso', async () => {
      const createData = {
        username: 'testuser'
      };

      const response = await request(app)
        .post('/api/shared/create')
        .send(createData)
        .expect(201);

      expect(response.body).toHaveProperty('shareToken');
      expect(response.body).toHaveProperty('expiresAt');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('shareUrl');
      expect(typeof response.body.shareToken).toBe('string');
      expect(response.body.shareToken.length).toBeGreaterThan(0);
    });

    it('deve criar link para usuário válido', async () => {
      const createData = {
        username: 'existinguser'
      };

      const response = await request(app)
        .post('/api/shared/create')
        .send(createData)
        .expect(201);

      expect(response.body).toHaveProperty('shareToken');
      expect(response.body).toHaveProperty('shareUrl');
      expect(response.body.shareUrl).toContain('/api/shared/');
    });

    it('deve retornar erro para username ausente', async () => {
      const response = await request(app)
        .post('/api/shared/create')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('obrigatório');
    });

    it('deve retornar erro para username vazio', async () => {
      const invalidData = {
        username: ''
      };

      const response = await request(app)
        .post('/api/shared/create')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar 404 para usuário inexistente', async () => {
      const invalidData = {
        username: 'nonexistentuser'
      };

      const response = await request(app)
        .post('/api/shared/create')
        .send(invalidData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('não encontrado');
    });
  });

  describe('GET /api/shared/:shareToken', () => {
    it('deve retornar lista compartilhada válida', async () => {
      const response = await request(app)
        .get('/api/shared/valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('username', 'testuser');
      expect(response.body).toHaveProperty('favorites');
      expect(response.body).toHaveProperty('totalMovies');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('expiresAt');
      expect(Array.isArray(response.body.favorites)).toBe(true);
      expect(response.body.totalMovies).toBeGreaterThanOrEqual(0);
    });

    it('deve retornar 404 para token inválido', async () => {
      const response = await request(app)
        .get('/api/shared/invalid-token')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('inválido ou expirado');
    });

    it('deve retornar 404 para token expirado', async () => {
      const response = await request(app)
        .get('/api/shared/expired-token')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('inválido ou expirado');
    });

    it('deve retornar 404 para token muito curto', async () => {
      await request(app)
        .get('/api/shared/ab')
        .expect(404);

      await request(app)
        .get('/api/shared/123')
        .expect(404);
    });

    it('deve aceitar token recém-criado', async () => {
      // Primeiro criar um link
      const createResponse = await request(app)
        .post('/api/shared/create')
        .send({ username: 'testuser' })
        .expect(201);

      const newToken = createResponse.body.shareToken;

      // Depois acessar o link
      const response = await request(app)
        .get(`/api/shared/${newToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('username', 'testuser');
      expect(response.body).toHaveProperty('favorites');
      expect(Array.isArray(response.body.favorites)).toBe(true);
    });
  });

  describe('GET /api/shared/links/user', () => {
    it('deve retornar links de compartilhamento do usuário', async () => {
      const response = await request(app)
        .get('/api/shared/links/user')
        .query({ username: 'testuser' })
        .expect(200);

      expect(response.body).toHaveProperty('sharedLinks');
      expect(Array.isArray(response.body.sharedLinks)).toBe(true);
      // testuser tem links no banco de teste
      expect(response.body.sharedLinks.length).toBeGreaterThan(0);
      expect(response.body.sharedLinks[0]).toHaveProperty('shareToken');
      expect(response.body.sharedLinks[0]).toHaveProperty('shareUrl');
      expect(response.body.sharedLinks[0]).toHaveProperty('createdAt');
      expect(response.body.sharedLinks[0]).toHaveProperty('expiresAt');
      expect(response.body.sharedLinks[0]).toHaveProperty('isExpired');
    });

    it('deve retornar lista vazia para usuário sem links', async () => {
      const response = await request(app)
        .get('/api/shared/links/user')
        .query({ username: 'emptyuser' })
        .expect(200);

      expect(response.body.sharedLinks).toEqual([]);
    });

    it('deve retornar 404 para usuário inexistente', async () => {
      const response = await request(app)
        .get('/api/shared/links/user')
        .query({ username: 'nonexistentuser' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('não encontrado');
    });

    it('deve retornar erro para username ausente', async () => {
      const response = await request(app)
        .get('/api/shared/links/user')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro para username vazio', async () => {
      const response = await request(app)
        .get('/api/shared/links/user')
        .query({ username: '' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/shared/update', () => {
    it('deve atualizar link de compartilhamento com sucesso', async () => {
      const updateData = {
        username: 'testuser',
        shareToken: 'test-share-token-static',
        expiresDays: 14 // 14 dias
      };

      const response = await request(app)
        .put('/api/shared/update')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Data de expiração atualizada com sucesso!');
    });

    it('deve retornar erro para shareToken ausente', async () => {
      const incompleteData = {
        username: 'testuser',
        expiresDays: 7
      };

      const response = await request(app)
        .put('/api/shared/update')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro para shareToken vazio', async () => {
      const invalidData = {
        username: 'testuser',
        shareToken: '',
        expiresDays: 7
      };

      const response = await request(app)
        .put('/api/shared/update')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro para token inexistente', async () => {
      const invalidData = {
        username: 'testuser',
        shareToken: 'nonexistent-token',
        expiresDays: 7
      };

      const response = await request(app)
        .put('/api/shared/update')
        .send(invalidData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('não encontrado');
    });

    it('deve aceitar valor de expiração inválido', async () => {
      const invalidData = {
        username: 'testuser',
        shareToken: 'test-share-token-static',
        expiresDays: 'invalid'
      };

      const response = await request(app)
        .put('/api/shared/update')
        .send(invalidData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Data de expiração atualizada com sucesso!');
    });

    it('deve aceitar valor de expiração negativo', async () => {
      const invalidData = {
        username: 'testuser',
        shareToken: 'test-share-token-static',
        expiresDays: -1 // valor negativo
      };

      const response = await request(app)
        .put('/api/shared/update')
        .send(invalidData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Data de expiração atualizada com sucesso!');
    });
  });

  describe('DELETE /api/shared/delete', () => {
    it('deve remover link de compartilhamento com sucesso', async () => {
      // Primeiro criar um link para depois remover
      const createResponse = await request(app)
        .post('/api/shared/create')
        .send({ username: 'testuser' })
        .expect(201);

      const newToken = createResponse.body.shareToken;

      // Agora remover
      const deleteData = {
        username: 'testuser',
        shareToken: newToken
      };

      const response = await request(app)
        .delete('/api/shared/delete')
        .send(deleteData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Link de compartilhamento removido com sucesso!');
    });

    it('deve remover link existente do banco de teste', async () => {
      const deleteData = {
        username: 'testuser',
        shareToken: 'test-share-token-static'
      };

      const response = await request(app)
        .delete('/api/shared/delete')
        .send(deleteData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Link de compartilhamento removido com sucesso!');
    });

    it('deve retornar erro para shareToken ausente', async () => {
      const response = await request(app)
        .delete('/api/shared/delete')
        .send({ username: 'testuser' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro para shareToken vazio', async () => {
      const invalidData = {
        username: 'testuser',
        shareToken: ''
      };

      const response = await request(app)
        .delete('/api/shared/delete')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro para token inexistente', async () => {
      const invalidData = {
        username: 'testuser',
        shareToken: 'nonexistent-token'
      };

      const response = await request(app)
        .delete('/api/shared/delete')
        .send(invalidData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('não encontrado');
    });

    it('deve retornar erro para token de outro usuário', async () => {
      const invalidData = {
        username: 'emptyuser', // Diferente dono do token
        shareToken: 'test-share-token-static' // Token pertence a testuser
      };

      const response = await request(app)
        .delete('/api/shared/delete')
        .send(invalidData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Validação de Dados', () => {
    it('deve retornar 404 para username muito longo (não encontrado)', async () => {
      const invalidData = {
        username: 'a'.repeat(51) // 51 caracteres
      };

      await request(app)
        .post('/api/shared/create')
        .send(invalidData)
        .expect(404);
    });

    it('deve retornar 404 para caracteres especiais (não encontrado)', async () => {
      const invalidData = {
        username: 'user@#$%'
      };

      await request(app)
        .post('/api/shared/create')
        .send(invalidData)
        .expect(404);
    });

    it('deve retornar erro para valor de expiração zero', async () => {
      const invalidData = {
        username: 'testuser',
        shareToken: 'test-share-token-static',
        expiresDays: 0 // valor zero
      };

      const response = await request(app)
        .put('/api/shared/update')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});