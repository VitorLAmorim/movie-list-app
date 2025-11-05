const db = require('../utils/database');
const { v4: uuidv4 } = require('uuid');

class SharedList {
  static async create(userId, expiresDays = 30) {
    const shareToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresDays);

    const result = await db.query(
      `INSERT INTO shared_lists (user_id, share_token, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, shareToken, expiresAt]
    );
    return result.rows[0];
  }

  static async getByToken(shareToken) {
    const result = await db.query(
      `SELECT sl.*, u.username FROM shared_lists sl
       JOIN users u ON sl.user_id = u.id
       WHERE sl.share_token = $1 AND (sl.expires_at IS NULL OR sl.expires_at > NOW())`,
      [shareToken]
    );
    return result.rows[0];
  }

  static async getByUser(userId) {
    const result = await db.query(
      'SELECT * FROM shared_lists WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async updateExpiration(shareToken, expiresDays) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresDays);

    const result = await db.query(
      `UPDATE shared_lists SET expires_at = $1
       WHERE share_token = $2
       RETURNING *`,
      [expiresAt, shareToken]
    );
    return result.rows[0];
  }

  static async delete(shareToken, userId) {
    const result = await db.query(
      'DELETE FROM shared_lists WHERE share_token = $1 AND user_id = $2 RETURNING *',
      [shareToken, userId]
    );
    return result.rows[0];
  }

  static async cleanupExpired() {
    const result = await db.query(
      'DELETE FROM shared_lists WHERE expires_at < NOW() RETURNING *'
    );
    return result.rows;
  }
}

module.exports = SharedList;