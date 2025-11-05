const { DatabaseFactory } = require('./database-factory');

let dbInstance = null;

async function getDatabase() {
  if (!dbInstance) {
    dbInstance = await DatabaseFactory.getInstance();
  }
  return dbInstance;
}

// Wrapper para compatibilidade com código existente
module.exports = {
  query: async (text, params) => {
    const db = await getDatabase();
    return db.query(text, params);
  },

  // Para compatibilidade com código que precisa do pool direto
  pool: {
    query: async (text, params) => {
      const db = await getDatabase();
      return db.query(text, params);
    }
  }
};