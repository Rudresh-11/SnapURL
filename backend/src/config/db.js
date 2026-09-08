import pkg from "pg"
const { Pool } = pkg

let pool

function describeTarget(connectionString) {
  if (!connectionString) return "DATABASE_URL is not set"
  try {
    const u = new URL(connectionString)
    return `${u.username}@${u.hostname}:${u.port || 5432}${u.pathname}`
  } catch {
    return "unparseable DATABASE_URL"
  }
}

export default async function connectDB() {
  console.log("Connecting to DB:", describeTarget(process.env.DATABASE_URL))

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    allowExitOnIdle: true,
    keepAlive: true,
    statement_timeout: 5000,
    connectionTimeoutMillis: 20000,
    host: undefined,
  })

  pool.on("error", (err) => {
    if (process.env.NODE_ENV === "test") return
    console.error("DB pool error:", err)
  })

  try {
    console.log("Trying to connect to the database...")
    const res = await pool.query("SELECT NOW()")
    console.log("DB OK", res.rows)
  } catch (err) {
    console.error("DB Connection error:", err)
    throw err
  }

  return pool
}

export function getDB() {
  if (!pool) throw new Error("Database not initialized")
  return pool
}
