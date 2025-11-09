import { DatabaseFactory } from './database-factory';
import { DatabaseResult } from '../types';

let dbInstance: any = null;

async function getDatabase(): Promise<any> {
  if (!dbInstance) {
    dbInstance = await DatabaseFactory.getInstance();
  }
  return dbInstance;
}

interface DatabaseInterface {
  query: (text: string, params?: any[]) => Promise<DatabaseResult>;
  pool: {
    query: (text: string, params?: any[]) => Promise<DatabaseResult>;
  };
}

const database: DatabaseInterface = {
  query: async (text: string, params?: any[]): Promise<DatabaseResult> => {
    const db = await getDatabase();
    return db.query(text, params);
  },

  // Para compatibilidade com código que precisa do pool direto
  pool: {
    query: async (text: string, params?: any[]): Promise<DatabaseResult> => {
      const db = await getDatabase();
      return db.query(text, params);
    }
  }
};

export default database;