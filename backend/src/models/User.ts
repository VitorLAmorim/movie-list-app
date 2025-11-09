import { DatabaseResult, User } from '../types';
import database from '../utils/database';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

class UserModel {
  static async create(username: string, password: string): Promise<User> {
    try {
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const result: DatabaseResult = await database.query(
        'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *',
        [username, passwordHash]
      );
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new Error('Nome de usuário já existe');
      }
      throw error;
    }
  }

  static async createWithoutPassword(username: string): Promise<User> {
    try {
      const result: DatabaseResult = await database.query(
        'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *',
        [username, '']
      );
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new Error('Nome de usuário já existe');
      }
      throw error;
    }
  }

  static async findById(id: number): Promise<User | undefined> {
    const result: DatabaseResult = await database.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByUsername(username: string): Promise<User | undefined> {
    const result: DatabaseResult = await database.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
  }

  static async getAll(): Promise<User[]> {
    const result: DatabaseResult = await database.query('SELECT id, username, created_at FROM users ORDER BY created_at DESC');
    return result.rows;
  }

  static async authenticate(username: string, password: string): Promise<User | null> {
    try {
      const result: DatabaseResult = await database.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );

      if (result.rowCount === 0) {
        return null;
      }

      const user = result.rows[0];

      // Se o usuário não tem senha (criado antes da implementação de senhas)
      if (!user.password_hash || user.password_hash === '') {
        // Permitir login apenas com username para compatibilidade
        return user;
      }

      // Verificar a senha
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('Erro na autenticação:', error);
      return null;
    }
  }

  static async setPassword(userId: number, password: string): Promise<void> {
    try {
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      await database.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [passwordHash, userId]
      );
    } catch (error) {
      console.error('Erro ao definir senha:', error);
      throw error;
    }
  }
}

export default UserModel;