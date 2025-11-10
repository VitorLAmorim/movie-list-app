import request from 'supertest';
import app from '../server';

describe('Testes Básicos', () => {
  it('deve retornar status OK na rota de saúde', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('version', '1.0.0');
  });

  it('deve retornar 404 para rota inexistente', async () => {
    const response = await request(app)
      .get('/api/rota-inexistente')
      .expect(404);

    expect(response.body).toHaveProperty('error', 'Rota não encontrada');
  });
});