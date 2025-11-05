const db = require('../utils/database');

class User {
  static async create(username) {
    try {
      const result = await db.query(
        'INSERT INTO users (username) VALUES ($1) RETURNING *',
        [username]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Nome de usuário já existe');
      }
      throw error;
    }
  }

  static async findById(id) {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByUsername(username) {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
  }

  static async getAll() {
    const result = await db.query('SELECT id, username, created_at FROM users ORDER BY created_at DESC');
    return result.rows;
  }
}

module.exports = User;