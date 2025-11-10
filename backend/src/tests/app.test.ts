import request from 'supertest';
import app from '../server';

describe('Aplicação Principal', () => {
  describe('Health Check', () => {
    it('deve retornar status OK no endpoint de saúde', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version', '1.0.0');
    });

    it('deve retornar timestamp válido', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(isNaN(timestamp.getTime())).toBe(false);
    });
  });

  describe('Rotas não encontradas', () => {
    it('deve retornar 404 para rota inexistente', async () => {
      await request(app)
        .get('/api/rota-inexistente')
        .expect(404);
    });

    it('deve retornar mensagem de erro apropriada', async () => {
      const response = await request(app)
        .get('/api/rota-inexistente')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Rota não encontrada');
    });
  });

  describe('Middleware de CORS', () => {
    it('deve incluir headers CORS', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Rate Limiting', () => {
    it('deve permitir requisições normais', async () => {
      await request(app)
        .get('/api/health')
        .expect(200);
    });
  });

  describe('Headers de Segurança', () => {
    it('deve incluir headers de segurança do Helmet', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      // Verificar alguns headers de segurança comuns do Helmet
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });
});