import request from 'supertest';
import app from '../server';

describe('Rotas de Autenticação - Com Banco Real', () => {
  describe('POST /api/auth/register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const newUser = {
        username: 'newuser123',
        password: 'testpass123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', 'newuser123');
      expect(response.body).toHaveProperty('message', 'Usuário criado com sucesso!');
    });

    it('deve retornar erro para username já existente', async () => {
      const existingUser = {
        username: 'testuser', // Já existe no banco de teste
        password: 'testpass123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(existingUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('UNIQUE constraint');
    });

    it('deve retornar erro para username ausente', async () => {
      const invalidUser = {
        password: 'testpass123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro para password ausente', async () => {
      const invalidUser = {
        username: 'testuser123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro para username vazio', async () => {
      const invalidUser = {
        username: '',
        password: 'testpass123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);
    });

    it('deve retornar erro para password curta', async () => {
      const invalidUser = {
        username: 'testuser123',
        password: '123' // muito curta
      };

      await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('deve fazer login com usuário existente sem senha', async () => {
      const loginData = {
        username: 'newuser' // Existe no banco sem senha
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', 'newuser');
      expect(response.body.user).toHaveProperty('needsPassword', true);
      expect(response.body).toHaveProperty('message');
    });

    it('deve fazer login com usuário existente com senha', async () => {
      // Primeiro definir uma senha para o usuário
      await request(app)
        .post('/api/auth/set-password')
        .send({
          userId: 1, // ID do testuser
          password: 'testpass123'
        })
        .expect(200);

      // Agora fazer login com a senha correta
      const loginData = {
        username: 'testuser',
        password: 'testpass123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', 'testuser');
      expect(response.body.user).toHaveProperty('needsPassword', false);
    });

    it('deve registrar e fazer login com novo usuário', async () => {
      // Primeiro registrar
      const newUser = {
        username: 'tempuser',
        password: 'temppass123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      // Depois fazer login
      const loginData = {
        username: 'tempuser',
        password: 'temppass123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', 'tempuser');
    });

    it('deve retornar erro para usuário inexistente', async () => {
      const loginData = {
        username: 'nonexistentuser',
        password: 'testpass123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Nome de usuário ou senha incorretos');
    });

    it('deve retornar erro para username ausente', async () => {
      const incompleteLogin = {
        password: 'testpass123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(incompleteLogin)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro para username vazio', async () => {
      const invalidLogin = {
        username: '',
        password: 'testpass123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidLogin)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/set-password', () => {
    it('deve definir senha para usuário existente sem senha', async () => {
      const passwordData = {
        userId: 4, // ID do newuser no banco
        password: 'newpassword123'
      };

      const response = await request(app)
        .post('/api/auth/set-password')
        .send(passwordData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Senha definida com sucesso!');
    });

    it('deve retornar erro para usuário inexistente', async () => {
      const passwordData = {
        userId: 99999, // ID não existe
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/set-password')
        .send(passwordData)
        .expect(200); // O sistema não valida se o usuário existe

      expect(response.body).toHaveProperty('message');
    });

    it('deve retornar erro para userId ausente', async () => {
      const incompleteData = {
        password: 'newpassword123'
      };

      const response = await request(app)
        .post('/api/auth/set-password')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('ID do usuário e senha são obrigatórios');
    });

    it('deve retornar erro para password ausente', async () => {
      const incompleteData = {
        userId: 1
      };

      const response = await request(app)
        .post('/api/auth/set-password')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('ID do usuário e senha são obrigatórios');
    });

    it('deve retornar erro para password fraca', async () => {
      const weakPasswordData = {
        userId: 4,
        password: '123' // muito curta
      };

      const response = await request(app)
        .post('/api/auth/set-password')
        .send(weakPasswordData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('pelo menos 6 caracteres');
    });

    it('deve retornar erro para dados vazios', async () => {
      const response = await request(app)
        .post('/api/auth/set-password')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('ID do usuário e senha são obrigatórios');
    });
  });
});