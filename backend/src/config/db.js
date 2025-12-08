import pkg from "pg";
const { Pool } = pkg;

let pool;

// export default async function connectDB() {
//   pool = new Pool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME,
//     port: process.env.DB_PORT || 5432,
//   });

export default async function connectDB() {
  console.log("Connecting to DB with connection string:", process.env.DATABASE_URL);
  
  pool = new Pool({
    
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    allowExitOnIdle: true,
    keepAlive: true,
    statement_timeout: 5000,
    connectionTimeoutMillis: 20000,
    host: undefined,
  });
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false
//   }
// });

  try {
    pool.query("SELECT NOW()")
  .then(res => console.log("DB OK", res.rows))
  .catch(err => console.error("QUERY FAILED", err));
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