const db = require('../utils/database');

class Favorite {
  static async add(userId, movieData) {
    try {
      const result = await db.query(
        `INSERT INTO favorites (user_id, movie_id, movie_title, movie_poster, movie_rating, movie_release_date, movie_overview)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          userId,
          movieData.id,
          movieData.title,
          movieData.poster,
          movieData.rating,
          movieData.releaseDate,
          movieData.overview
        ]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Este filme já está na sua lista de favoritos');
      }
      throw error;
    }
  }

  static async remove(userId, movieId) {
    const result = await db.query(
      'DELETE FROM favorites WHERE user_id = $1 AND movie_id = $2 RETURNING *',
      [userId, movieId]
    );
    return result.rows[0];
  }

  static async getByUser(userId) {
    const result = await db.query(
      `SELECT * FROM favorites
       WHERE user_id = $1
       ORDER BY added_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async checkFavorite(userId, movieId) {
    const result = await db.query(
      'SELECT * FROM favorites WHERE user_id = $1 AND movie_id = $2',
      [userId, movieId]
    );
    return result.rows[0];
  }

  static async getByShareToken(shareToken) {
    const result = await db.query(
      `SELECT f.* FROM favorites f
       JOIN users u ON f.user_id = u.id
       JOIN shared_lists s ON u.id = s.user_id
       WHERE s.share_token = $1 AND (s.expires_at IS NULL OR s.expires_at > NOW())
       ORDER BY f.added_at DESC`,
      [shareToken]
    );
    return result.rows;
  }

  static async getStats(userId) {
    const result = await db.query(
      'SELECT COUNT(*) as total_count, AVG(movie_rating) as avg_rating FROM favorites WHERE user_id = $1',
      [userId]
    );
    return result.rows[0];
  }
}

module.exports = Favorite;