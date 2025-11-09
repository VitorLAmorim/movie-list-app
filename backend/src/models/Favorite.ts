import { DatabaseResult, Favorite } from '../types';
import database from '../utils/database';

interface MovieData {
  id: number;
  title: string;
  poster: string | null;
  rating: number;
  releaseDate: string;
  overview: string;
}

interface FavoriteStats {
  total_count: number;
  avg_rating: number;
}

class FavoriteModel {
  static async add(userId: number, movieData: MovieData): Promise<Favorite> {
    try {
      const result: DatabaseResult = await database.query(
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
    } catch (error: any) {
      if (error.code === '23505') {
        throw new Error('Este filme já está na sua lista de favoritos');
      }
      throw error;
    }
  }

  static async remove(userId: number, movieId: number): Promise<Favorite | undefined> {
    const result: DatabaseResult = await database.query(
      'DELETE FROM favorites WHERE user_id = $1 AND movie_id = $2 RETURNING *',
      [userId, movieId]
    );
    return result.rows[0];
  }

  static async getByUser(userId: number): Promise<Favorite[]> {
    const result: DatabaseResult = await database.query(
      `SELECT * FROM favorites
       WHERE user_id = $1
       ORDER BY added_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async checkFavorite(userId: number, movieId: number): Promise<Favorite | undefined> {
    const result: DatabaseResult = await database.query(
      'SELECT * FROM favorites WHERE user_id = $1 AND movie_id = $2',
      [userId, movieId]
    );
    return result.rows[0];
  }

  static async getByShareToken(shareToken: string): Promise<Favorite[]> {
    const result: DatabaseResult = await database.query(
      `SELECT f.* FROM favorites f
       JOIN users u ON f.user_id = u.id
       JOIN shared_lists s ON u.id = s.user_id
       WHERE s.share_token = $1 AND (s.expires_at IS NULL OR s.expires_at > NOW())
       ORDER BY f.added_at DESC`,
      [shareToken]
    );
    return result.rows;
  }

  static async getStats(userId: number): Promise<FavoriteStats> {
    const result: DatabaseResult = await database.query(
      'SELECT COUNT(*) as total_count, AVG(movie_rating) as avg_rating FROM favorites WHERE user_id = $1',
      [userId]
    );
    return result.rows[0];
  }
}

export default FavoriteModel;