import pkg from "pg";
const { Pool } = pkg;

let pool;

export default async function connectDB() {
  pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
  });

  try {
    await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected");
  } catch (err) {
    console.error("DB Connection error:", err);
    throw err;
  }

  return pool;
}

export function getDB() {
  if (!pool) throw new Error("Database not initialized");
  return pool;
}