const { pool } = require("../config/database");
const bcrypt = require("bcryptjs");

class User {
  /* 
     CREATE USER
  */
  static async create({ name, email, password, address, role }) {
    const hashed = await bcrypt.hash(password, 10);

    const [rows] = await pool.execute(
      `
      INSERT INTO users (name, email, password, address, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
      `,
      [name, email, hashed, address, role]
    );

    return rows[0].id;
  }

  /* 
     FIND BY EMAIL (with full data)
 */
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT id, name, email, password, address, role, created_at, updated_at 
       FROM users WHERE email = $1`,
      [email]
    );
    return rows[0] || null;
  }

  /* 
     GET USER BY ID (NO PASSWORD)
   */
  static async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT id, name, email, address, role, created_at, updated_at 
      FROM users WHERE id = $1
      `,
      [id]
    );
    return rows[0] || null;
  }

  /* 
     FIND USER WITH PASSWORD
  */
  static async findByIdWithPassword(id) {
    const [rows] = await pool.execute(`SELECT * FROM users WHERE id = $1`, [
      id,
    ]);
    return rows[0] || null;
  }

  /* 
     GET ALL USERS + FILTERS (INCLUDES created_at)
  */
  static async getAllUsers(filters = {}) {
    let query = `
      SELECT 
        id, name, email, address, role, created_at, updated_at
      FROM users 
      WHERE 1=1
    `;
    const params = [];

    if (filters.name) {
      params.push(`%${filters.name}%`);
      query += ` AND name ILIKE $${params.length}`;
    }

    if (filters.email) {
      params.push(`%${filters.email}%`);
      query += ` AND email ILIKE $${params.length}`;
    }

    if (filters.address) {
      params.push(`%${filters.address}%`);
      query += ` AND address ILIKE $${params.length}`;
    }

    if (filters.role) {
      params.push(filters.role);
      query += ` AND role = $${params.length}`;
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  /* 
     COUNT USERS
   */
  static async getUsersCount() {
    const [rows] = await pool.execute(`SELECT COUNT(*) AS count FROM users`);
    return Number(rows[0].count) || 0;
  }

  /* 
     UPDATE PASSWORD
   */
  static async updatePassword(userId, newPassword) {
    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.execute(
      `UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2`,
      [hashed, userId]
    );
  }

  /*
     VERIFY PASSWORD
   */
  static async verifyPassword(plain, hashed) {
    return bcrypt.compare(plain, hashed);
  }

  /* 
     GET USERS BY ROLE (WITH created_at)
   */
  static async getUsersByRole(role) {
    const [rows] = await pool.execute(
      `
      SELECT id, name, email, address, role, created_at, updated_at 
      FROM users 
      WHERE role = $1
      `,
      [role]
    );
    return rows;
  }

  static async updateProfile(id, { name, email, address }) {
    const [rows] = await pool.execute(
      `
    UPDATE users
    SET 
      name = $1,
      email = $2,
      address = $3,
      updated_at = NOW()
    WHERE id = $4
    RETURNING id, name, email, address, role, created_at, updated_at
    `,
      [name, email, address, id]
    );

    return rows[0];
  }
}

module.exports = User;
