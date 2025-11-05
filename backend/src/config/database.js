require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// Configuração para diferentes ambientes
const databaseConfig = {
  // PostgreSQL (principal)
  postgresql: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },

  // SQLite (fallback para desenvolvimento)
  sqlite: {
    client: 'sqlite3',
    connection: {
      filename: './movie_list.db'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};

// Determinar qual configuração usar
function getDatabaseConfig() {
  const dbUrl = process.env.DATABASE_URL || '';

  if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    return databaseConfig.postgresql;
  } else if (dbUrl.startsWith('sqlite:')) {
    return databaseConfig.sqlite;
  } else if (process.env.NODE_ENV === 'production') {
    // Em produção, exigir PostgreSQL
    throw new Error('DATABASE_URL com PostgreSQL é obrigatório em produção');
  } else {
    // Em desenvolvimento, tentar PostgreSQL ou fallback para SQLite
    console.log('🔧 Usando SQLite para desenvolvimento local');
    return databaseConfig.sqlite;
  }
}

module.exports = getDatabaseConfig();