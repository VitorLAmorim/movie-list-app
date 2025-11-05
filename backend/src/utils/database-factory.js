require('dotenv').config();

const { Pool } = require('pg');
const { getDatabase: getSQLiteDB } = require('./database-sqlite');

class DatabaseFactory {
  static instance = null;

  static async getInstance() {
    if (!DatabaseFactory.instance) {
      const dbUrl = process.env.DATABASE_URL || '';

      if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
        console.log('🐘 Usando PostgreSQL');
        DatabaseFactory.instance = new PostgreSQLDatabase();
      } else {
        console.log('📁 Usando SQLite para desenvolvimento');
        DatabaseFactory.instance = new SQLiteDatabaseWrapper();
      }

      await DatabaseFactory.instance.connect();
    }

    return DatabaseFactory.instance;
  }
}

class PostgreSQLDatabase {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  async connect() {
    try {
      const client = await this.pool.connect();
      console.log('✅ Conectado ao PostgreSQL com sucesso');
      client.release();
    } catch (error) {
      console.error('❌ Erro ao conectar ao PostgreSQL:', error.message);
      throw error;
    }
  }

  async query(text, params) {
    const result = await this.pool.query(text, params);
    return { rows: result.rows };
  }

  async close() {
    await this.pool.end();
    console.log('🐘 Conexão PostgreSQL fechada');
  }
}

class SQLiteDatabaseWrapper {
  constructor() {
    this.db = null;
  }

  async connect() {
    this.db = await getSQLiteDB();
  }

  async query(text, params = []) {
    // Convert PostgreSQL parameter syntax ($1, $2) to SQLite syntax (?, ?)
    const sqliteText = text.replace(/\$(\d+)/g, '?');
    return this.db.query(sqliteText, params);
  }

  async close() {
    if (this.db) {
      await this.db.close();
    }
  }
}

module.exports = { DatabaseFactory };