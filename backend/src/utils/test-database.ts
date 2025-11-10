import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

/**
 * Utilitário de banco de dados em memória para testes
 */
export class TestDatabase {
  private db: Database | null = null;
  private static instance: TestDatabase;

  private constructor() {}

  static getInstance(): TestDatabase {
    if (!TestDatabase.instance) {
      TestDatabase.instance = new TestDatabase();
    }
    return TestDatabase.instance;
  }

  async connect(): Promise<Database> {
    if (!this.db) {
      this.db = await open({
        filename: ':memory:',
        driver: sqlite3.Database
      });

      // Habilitar chaves estrangeiras
      await this.db.exec('PRAGMA foreign_keys = ON');

      // Criar tabelas
      await this.createTables();

      // Inserir dados de teste
      await this.seedTestData();
    }
    return this.db;
  }

  private async createTables(): Promise<void> {
    // Tabela de usuários
    await this.db!.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de favoritos
    await this.db!.exec(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        movie_id INTEGER NOT NULL,
        movie_title TEXT NOT NULL,
        movie_overview TEXT,
        movie_release_date TEXT,
        movie_rating REAL DEFAULT 0,
        movie_poster TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, movie_id)
      )
    `);

    // Tabela de listas compartilhadas
    await this.db!.exec(`
      CREATE TABLE IF NOT EXISTS shared_lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        share_token TEXT UNIQUE NOT NULL,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
  }

  private async seedTestData(): Promise<void> {
    // Inserir usuários de teste
    await this.db!.run(`
      INSERT OR IGNORE INTO users (id, username, password_hash) VALUES
      (1, 'testuser', '$2a$10$testhash'),
      (2, 'existinguser', '$2a$10$existinghash'),
      (3, 'emptyuser', '$2a$10$emptyhash'),
      (4, 'newuser', NULL)
    `);

    // Inserir favoritos de teste
    await this.db!.run(`
      INSERT OR IGNORE INTO favorites (user_id, movie_id, movie_title, movie_overview, movie_release_date, movie_rating, movie_poster) VALUES
      (1, 123, 'Test Movie', 'Test overview for integration testing', '2023-01-01', 8.5, 'https://example.com/poster.jpg'),
      (1, 456, 'Another Movie', 'Another test movie', '2023-06-15', 7.2, 'https://example.com/poster2.jpg'),
      (2, 789, 'Existing User Movie', 'Movie for existing user', '2023-03-10', 9.0, 'https://example.com/poster3.jpg')
    `);

    // Inserir listas compartilhadas de teste
    await this.db!.run(`
      INSERT OR IGNORE INTO shared_lists (user_id, share_token, expires_at) VALUES
      (1, 'valid-token', datetime('now', '+7 days')),
      (1, 'expired-token', datetime('now', '-7 days')),
      (1, 'test-share-token-static', datetime('now', '+7 days'))
    `);
  }

  async reset(): Promise<void> {
    if (this.db) {
      // Limpar dados mas manter estrutura
      await this.db.run('DELETE FROM shared_lists');
      await this.db.run('DELETE FROM favorites');
      await this.db.run('DELETE FROM users');

      // Reinserir dados de teste
      await this.seedTestData();
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    const db = await this.connect();

    // Converter sintaxe PostgreSQL para SQLite
    let sqliteSql = sql.replace(/\$(\d+)/g, '?');

    // Converter funções PostgreSQL para SQLite (simples e direto)
    sqliteSql = sqliteSql.replace(/NOW\(\)/g, "datetime('now')");

    const results = await db.all(sqliteSql, params);

    // Formatar resultado para compatibilidade com PostgreSQL
    return {
      rows: results,
      rowCount: results.length
    };
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    const db = await this.connect();

    // Converter sintaxe PostgreSQL para SQLite
    let sqliteSql = sql.replace(/\$(\d+)/g, '?');
    // Converter funções PostgreSQL para SQLite
    sqliteSql = sqliteSql.replace(/NOW\(\)/g, "datetime('now')");
    sqliteSql = sqliteSql.replace(/CURRENT_TIMESTAMP/g, "datetime('now')");

    return await db.get(sqliteSql, params);
  }

  async run(sql: string, params: any[] = []): Promise<any> {
    const db = await this.connect();

    // Converter sintaxe PostgreSQL para SQLite
    let sqliteSql = sql.replace(/\$(\d+)/g, '?');
    // Converter funções PostgreSQL para SQLite
    sqliteSql = sqliteSql.replace(/NOW\(\)/g, "datetime('now')");
    sqliteSql = sqliteSql.replace(/CURRENT_TIMESTAMP/g, "datetime('now')");

    const result = await db.run(sqliteSql, params);

    // Para INSERT com RETURNING, precisamos buscar o registro inserido
    if (sql.includes('INSERT') && sql.includes('RETURNING')) {
      const selectSql = sql.replace(/INSERT.*RETURNING/gi, 'SELECT');
      const inserted = await this.get(selectSql, params);
      return {
        rows: [inserted],
        rowCount: 1,
        lastID: result.lastID
      };
    }

    return {
      rows: [],
      rowCount: result.changes || 0,
      lastID: result.lastID
    };
  }
}

// Instância singleton para uso nos testes
export const testDb = TestDatabase.getInstance();