import { DatabaseResult, SharedList } from '../types';
import { v4 as uuidv4 } from 'uuid';
import database from '../utils/database';

class SharedListModel {
  static async create(userId: number, expiresDays: number = 30): Promise<SharedList> {
    const shareToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresDays);

    const result: DatabaseResult = await database.query(
      `INSERT INTO shared_lists (user_id, share_token, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, shareToken, expiresAt]
    );
    return result.rows[0];
  }

  static async getByToken(shareToken: string): Promise<SharedList | undefined> {
    const result: DatabaseResult = await database.query(
      `SELECT sl.*, u.username FROM shared_lists sl
       JOIN users u ON sl.user_id = u.id
       WHERE sl.share_token = $1 AND (sl.expires_at IS NULL OR sl.expires_at > NOW())`,
      [shareToken]
    );
    return result.rows[0];
  }

  static async getByUser(userId: number): Promise<SharedList[]> {
    const result: DatabaseResult = await database.query(
      'SELECT * FROM shared_lists WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async updateExpiration(shareToken: string, expiresDays: number): Promise<SharedList | undefined> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresDays);

    const result: DatabaseResult = await database.query(
      `UPDATE shared_lists SET expires_at = $1
       WHERE share_token = $2
       RETURNING *`,
      [expiresAt, shareToken]
    );
    return result.rows[0];
  }

  static async delete(shareToken: string, userId: number): Promise<SharedList | undefined> {
    const result: DatabaseResult = await database.query(
      'DELETE FROM shared_lists WHERE share_token = $1 AND user_id = $2 RETURNING *',
      [shareToken, userId]
    );
    return result.rows[0];
  }

  static async cleanupExpired(): Promise<SharedList[]> {
    const result: DatabaseResult = await database.query(
      'DELETE FROM shared_lists WHERE expires_at < NOW() RETURNING *'
    );
    return result.rows;
  }
}

export default SharedListModel;