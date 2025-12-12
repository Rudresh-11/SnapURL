import pkg from "pg";
const { Pool } = pkg;

let pool;

export default async function connectDB() {
  console.log("Connecting to DB with connection string: ", process.env.DATABASE_URL);

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    allowExitOnIdle: true,
    keepAlive: true,
    statement_timeout: 5000,
    connectionTimeoutMillis: 20000,
    host: undefined,
  });

  // Prevent Node from crashing on transient/idle connection termination (e.g. db pooler shutdowns)
  // by ensuring the pool has an 'error' event listener.
  pool.on("error", (err) => {
    // Keep Jest output clean (and avoid "Cannot log after tests are done") while still
    // preventing an unhandled 'error' event from crashing the process.
    if (process.env.NODE_ENV === "test") return;
    console.error("DB pool error:", err);
  });
  // const pool = new Pool({
  //   connectionString: process.env.DATABASE_URL,
  //   ssl: {
  //     rejectUnauthorized: false
  //   }
  // });

  try {
    console.log('Trying to connect to the database...');
    const res = await pool.query("SELECT NOW()");
    console.log("DB OK", res.rows);
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