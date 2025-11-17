const { pool } = require("../config/database");

class Store {
  /* 
     CREATE STORE
   */
  static async create({ name, email, address, owner_id }) {
    const [rows] = await pool.execute(
      `
      INSERT INTO stores (name, email, address, owner_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [name, email, address, owner_id]
    );

    return rows[0].id;
  }

  /* 
     FIND STORE BY EMAIL
   */
  static async findByEmail(email) {
    const [rows] = await pool.execute(`SELECT * FROM stores WHERE email = $1`, [
      email,
    ]);
    return rows[0] || null;
  }

  /* 
     FIND STORE BY ID (FULL DETAILS)
   */
  static async findById(storeId) {
    const [rows] = await pool.execute(
      `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        s.created_at,
        s.updated_at,
        COALESCE(AVG(r.rating), 0)::numeric(3,2) AS average_rating,
        COUNT(r.rating) AS total_ratings
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE s.id = $1
      GROUP BY s.id
      `,
      [storeId]
    );

    return rows[0] || null;
  }

  /* 
     GET ALL STORES WITH FILTERING + SORTING
  */
  static async findAll(filters = {}) {
    let query = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        s.created_at,
        s.updated_at,
        COALESCE(AVG(r.rating), 0)::numeric(3,2) AS average_rating,
        COUNT(r.rating) AS total_ratings
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.name) {
      params.push(`%${filters.name}%`);
      query += ` AND s.name ILIKE $${params.length}`;
    }

    if (filters.email) {
      params.push(`%${filters.email}%`);
      query += ` AND s.email ILIKE $${params.length}`;
    }

    if (filters.address) {
      params.push(`%${filters.address}%`);
      query += ` AND s.address ILIKE $${params.length}`;
    }

    query += ` GROUP BY s.id`;

    // Sorting
    if (filters.sortBy) {
      const sortField =
        filters.sortBy === "rating" ? "average_rating" : filters.sortBy;
      const sortOrder = filters.sortOrder === "asc" ? "ASC" : "DESC";
      query += ` ORDER BY ${sortField} ${sortOrder}`;
    } else {
      query += ` ORDER BY s.created_at DESC`;
    }

    // Pagination
    if (filters.limit) {
      query += ` LIMIT ${Number(filters.limit)}`;
    }

    if (filters.offset) {
      query += ` OFFSET ${Number(filters.offset)}`;
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  /* 
     FIND STORES OWNED BY A STORE OWNER
   */
  static async findByOwnerId(ownerId) {
    const [rows] = await pool.execute(
      `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        s.created_at,
        s.updated_at,
        COALESCE(AVG(r.rating), 0)::numeric(3,2) AS average_rating,
        COUNT(r.rating) AS total_ratings
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE s.owner_id = $1
      GROUP BY s.id
      `,
      [ownerId]
    );

    return rows;
  }

  /* 
     GET ALL RATINGS FOR A STORE
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
        u.name AS user_name,
        u.email AS user_email
      FROM ratings r
      JOIN users u ON u.id = r.user_id
      WHERE r.store_id = $1
      ORDER BY r.created_at DESC
      `,
      [storeId]
    );

    return rows;
  }

  /* 
     UPDATE STORE AVERAGE RATING (after rating creation)
*/
  static async updateAverageRating(storeId) {
    await pool.execute(
      `
      UPDATE stores
      SET average_rating = (
        SELECT COALESCE(AVG(rating), 0)::numeric(3,2)
        FROM ratings
        WHERE store_id = $1
      ), updated_at = NOW()
      WHERE id = $1
      `,
      [storeId]
    );
  }

  /* 
     COUNT TOTAL STORES
 */
  static async getStoresCount() {
    const [rows] = await pool.execute(`SELECT COUNT(*) AS count FROM stores`);
    return Number(rows[0].count) || 0;
  }
}

module.exports = Store;
