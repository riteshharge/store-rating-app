const { Pool } = require("pg");
require("dotenv").config();

/* -------------------------------------------
   Decide config based on environment
-------------------------------------------- */

const isProduction = process.env.NODE_ENV === "production";

let poolConfig;

// If DATABASE_URL exists (Render / any cloud), use it
if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 10,
    // Render Postgres needs SSL in production
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  };
} else {
  // Fallback: local development using individual vars
  poolConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 10,
  };
}

// Create Pool
const pool = new Pool(poolConfig);

// Test connection
pool
  .connect()
  .then(() => console.log("PostgreSQL Connected"))
  .catch((err) => console.error("DB Connection Error:", err));

/* -------------------------------------------
   Convert MySQL-style ? to $1 $2 ...
-------------------------------------------- */
function mapPlaceholders(query, paramsLength) {
  let index = 0;
  return query.replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });
}

/* -------------------------------------------
   MySQL-compatible execute()
-------------------------------------------- */
pool.execute = async (query, params = []) => {
  const mappedQuery = mapPlaceholders(query, params.length);
  const result = await pool.query(mappedQuery, params);
  return [result.rows, result]; // keep MySQL2-style
};

/* -------------------------------------------
   RUN TABLE CREATION + DEFAULT ADMIN
-------------------------------------------- */
const initializeDatabase = async () => {
  try {
    // USERS table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        address VARCHAR(400) NOT NULL,
        role TEXT NOT NULL DEFAULT 'user'
          CHECK (role IN ('admin', 'user', 'store_owner')),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // STORES table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        address VARCHAR(400) NOT NULL,
        owner_id INT REFERENCES users(id) ON DELETE SET NULL,
        average_rating NUMERIC(3,2) DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      ALTER TABLE stores
      ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0;
    `);

    // RATINGS table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_store UNIQUE (user_id, store_id)
      )
    `);

    await pool.query(`
      ALTER TABLE ratings 
      ADD COLUMN IF NOT EXISTS comment TEXT;
    `);

    // DEFAULT ADMIN
    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash("Admin123!", 10);

    await pool.query(
      `
      INSERT INTO users (name, email, password, address, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
      `,
      [
        "System Administrator",
        "admin@store.com",
        hashedPassword,
        "123 Main St, Springfield",
        "admin",
      ]
    );

    console.log("Database initialized successfully.");
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
};

module.exports = {
  pool,
  initializeDatabase,
};
