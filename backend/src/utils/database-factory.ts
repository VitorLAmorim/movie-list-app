import { DatabaseResult } from '../types';
import { Pool } from 'pg';

require('dotenv').config();

interface DatabaseConnection {
  connect(): Promise<void>;
  query(text: string, params?: any[]): Promise<DatabaseResult>;
  close(): Promise<void>;
}

class DatabaseFactory {
  private static instance: DatabaseConnection | null = null;

  static async getInstance(): Promise<DatabaseConnection> {
    if (!DatabaseFactory.instance) {
      console.log('🐘 Usando PostgreSQL');
      DatabaseFactory.instance = new PostgreSQLDatabase();
      await DatabaseFactory.instance.connect();
    }

    return DatabaseFactory.instance;
  }
}

class PostgreSQLDatabase implements DatabaseConnection {
  private pool: Pool;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL não está configurada nas variáveis de ambiente');
    }

    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      console.log('✅ Conectado ao PostgreSQL com sucesso');
      client.release();
    } catch (error: any) {
      console.error('❌ Erro ao conectar ao PostgreSQL:', error.message);
      throw error;
    }
  }

  async query(text: string, params?: any[]): Promise<DatabaseResult> {
    const result = await this.pool.query(text, params);
    return { rows: result.rows, rowCount: result.rowCount || 0 };
  }

  async close(): Promise<void> {
    await this.pool.end();
    console.log('🐘 Conexão PostgreSQL fechada');
  }
}

export { DatabaseFactory };