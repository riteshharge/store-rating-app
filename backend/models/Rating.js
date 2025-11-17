const { pool } = require("../config/database");
const Store = require("./Store");

class Rating {
  /* 
     CREATE or UPDATE Rating + Auto-Update Store Avg Rating
  */
  static async createOrUpdate({ user_id, store_id, rating, comment }) {
    // Ensure rating is numeric & valid
    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      throw new Error("Invalid rating value. Rating must be between 1 and 5.");
    }

    const [rows] = await pool.execute(
      `
      INSERT INTO ratings (user_id, store_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, store_id)
      DO UPDATE SET 
          rating = EXCLUDED.rating,
          comment = EXCLUDED.comment,
          updated_at = NOW()
      RETURNING id
      `,
      [user_id, store_id, numericRating, comment || null]
    );

    // Auto-update average rating in stores table
    await Store.updateAverageRating(store_id);

    return rows[0].id;
  }

  /* 
     GET ALL RATINGS from a USER
   */
  static async getUserRatings(userId) {
    const [rows] = await pool.execute(
      `
      SELECT 
        r.id, 
        r.rating, 
        r.comment, 
        r.created_at, 
        r.updated_at,
        r.store_id,
        s.name AS store_name,
        s.address AS store_address
      FROM ratings r
      JOIN stores s ON s.id = r.store_id
      WHERE r.user_id = $1
      ORDER BY r.updated_at DESC
      `,
      [userId]
    );

    return rows;
  }

  /* 
     GET ALL RATINGS for a STORE
  */
  static async getStoreRatings(storeId) {
    const [rows] = await pool.execute(
      `
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        r.updated_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email
      FROM ratings r
      JOIN users u ON u.id = r.user_id
      WHERE r.store_id = $1
      ORDER BY r.updated_at DESC
      `,
      [storeId]
    );

    return rows;
  }

  /* 
     TOTAL RATINGS COUNT (Admin Dashboard)
   */
  static async getRatingsCount() {
    const [rows] = await pool.execute(`SELECT COUNT(*) AS count FROM ratings`);

    return Number(rows[0].count) || 0;
  }

  /* 
     DELETE RATING + Auto-Update Store Average
   */
  static async deleteRating(ratingId, userId) {
    const [rows] = await pool.execute(
      `
      DELETE FROM ratings 
      WHERE id = $1 AND user_id = $2
      RETURNING store_id
      `,
      [ratingId, userId]
    );

    if (rows.length === 0) return null;

    const storeId = rows[0].store_id;

    // Update store average rating after deletion
    await Store.updateAverageRating(storeId);

    return storeId;
  }
}

module.exports = Rating;
