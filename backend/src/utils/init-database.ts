import db from '../utils/database';

async function initTables(): Promise<void> {
  try {
    const createTables = `
      -- Criar tabela de usuários
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Criar tabela de filmes favoritos
      CREATE TABLE IF NOT EXISTS favorites (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          movie_id INTEGER NOT NULL,
          movie_title VARCHAR(255) NOT NULL,
          movie_poster VARCHAR(500),
          movie_rating DECIMAL(3,1),
          movie_release_date DATE,
          movie_overview TEXT,
          added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, movie_id)
      );

      -- Criar tabela de listas compartilhadas
      CREATE TABLE IF NOT EXISTS shared_lists (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          share_token VARCHAR(100) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP
      );

      -- Criar índices para melhor performance
      CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
      CREATE INDEX IF NOT EXISTS idx_favorites_movie_id ON favorites(movie_id);
      CREATE INDEX IF NOT EXISTS idx_shared_lists_token ON shared_lists(share_token);
    `;

    await db.query(createTables);

    // Verificar se a coluna password_hash existe na tabela users
    const checkPasswordColumn = await db.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'password_hash'
    `);

    // Se não existir, adicionar a coluna
    if (checkPasswordColumn.rowCount === 0) {
      await db.query(`
        ALTER TABLE users
        ADD COLUMN password_hash VARCHAR(255) DEFAULT ''
      `);
      console.log('✅ Coluna password_hash adicionada à tabela users');
    }

    console.log('✅ Tabelas criadas com sucesso!');

  } catch (error: any) {
    console.error('❌ Erro ao criar tabelas:', error);
    throw error;
  }
}

export { initTables };