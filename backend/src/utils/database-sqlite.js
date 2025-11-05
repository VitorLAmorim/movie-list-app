const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class SQLiteDatabase {
  constructor(dbPath = './movie_list.db') {
    this.dbPath = dbPath;
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Erro ao conectar ao SQLite:', err);
          reject(err);
        } else {
          console.log('✅ Conectado ao SQLite com sucesso');
          this.initTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async initTables() {
    const createTables = `
      -- Criar tabela de usuários
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Criar tabela de filmes favoritos
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        movie_id INTEGER NOT NULL,
        movie_title TEXT NOT NULL,
        movie_poster TEXT,
        movie_rating REAL,
        movie_release_date TEXT,
        movie_overview TEXT,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, movie_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Criar tabela de listas compartilhadas
      CREATE TABLE IF NOT EXISTS shared_lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        share_token TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Criar índices
      CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
      CREATE INDEX IF NOT EXISTS idx_favorites_movie_id ON favorites(movie_id);
      CREATE INDEX IF NOT EXISTS idx_shared_lists_token ON shared_lists(share_token);
    `;

    return new Promise((resolve, reject) => {
      this.db.exec(createTables, (err) => {
        if (err) {
          console.error('Erro ao criar tabelas:', err);
          reject(err);
        } else {
          console.log('✅ Tabelas criadas com sucesso');
          resolve();
        }
      });
    });
  }

  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve({ rows });
        }
      });
    });
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            changes: this.changes
          });
        }
      });
    });
  }

  async close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('📁 Conexão SQLite fechada');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

// Criar instância singleton
let dbInstance = null;

async function getDatabase() {
  if (!dbInstance) {
    const dbPath = process.env.DATABASE_URL?.replace('sqlite:', '') || './movie_list.db';
    dbInstance = new SQLiteDatabase(dbPath);
    await dbInstance.connect();
  }
  return dbInstance;
}

module.exports = { getDatabase, SQLiteDatabase };