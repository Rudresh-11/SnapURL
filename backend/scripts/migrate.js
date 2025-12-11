import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../src/config/db.js";
import { getDB } from "../src/config/db.js";
import "../src/config/loadEnv.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  await connectDB()
  const db = await getDB();
  const migrationsDir = path.join(__dirname, "..", "migrations");

  try {
    // Ensure migrations table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        run_on TIMESTAMP DEFAULT NOW()
      );
    `);

    // Get list of already executed migrations
    const executed = await db.query(`SELECT name FROM migrations ORDER BY id ASC`);
    const executedSet = new Set(executed.rows.map(r => r.name));

    // List migration files
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith(".sql"))
      .sort();

    console.log("\n🔍 Checking migrations...");

    for (const file of files) {
      if (executedSet.has(file)) {
        console.log(`✔ SKIP — ${file} already applied`);
        continue;
      }

      // Read and execute SQL file
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");

      console.log(`\n▶ Running migration: ${file}`);

      try {
        await db.query(sql);
        await db.query(`INSERT INTO migrations (name) VALUES ($1)`, [file]);

        console.log(`✔ SUCCESS — ${file}`);
      } catch (err) {
        console.error(`❌ FAILED — ${file}`);
        console.error(err);
        process.exit(1);
      }
    }

    console.log("\n🎉 All migrations complete!");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

runMigrations();
