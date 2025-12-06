import bcrypt from "bcrypt";
import pkg from "pg";
const { Pool } = pkg;

let pool;
async function getDB() {
  pool = new Pool({
    connectionString: "postgresql://postgres:7H)5Zi%pE7Cb25u@db.aeowpiggdrpsbwejpvnl.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false },
    allowExitOnIdle: true,
    keepAlive: true,
    statement_timeout: 5000,
    connectionTimeoutMillis: 5000,
    host: undefined,
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

async function seed() {
  const db = await getDB();

  console.log("🌱 Seeding database...");

  try {
    // =======================
    // 1. CLEAR existing data
    // =======================
    await db.query("DELETE FROM clicks;");
    await db.query("DELETE FROM urls;");
    await db.query("DELETE FROM users;");

    // =======================
    // 2. Seed Users
    // =======================
    const passwordHash = await bcrypt.hash("password123", 10);

    const userResults = await db.query(
      `
      INSERT INTO users (username, email, password_hash)
      VALUES 
      ('rudresh', 'rudresh@example.com', $1),
      ('john_doe', 'john@example.com', $1),
      ('alice99', 'alice@example.com', $1)
      RETURNING id, username, email;
      `,
      [passwordHash]
    );

    console.log("👤 Users added:", userResults.rows.length);

    // =======================
    // 3. Seed URLs
    // =======================
    const urlResults = await db.query(
      `
      INSERT INTO urls (user_id, original_url, short_code, custom_alias, expires_at, total_clicks)
      VALUES
        ($1, 'https://google.com', 'ggl123', NULL, NULL, 0),
        ($2, 'https://youtube.com', 'ytb456', NULL, NULL, 0),
        ($3, 'https://instagram.com', 'inst789', 'insta', NULL, 0)
      RETURNING id, user_id, short_code;
      `,
      [
        userResults.rows[0].id,
        userResults.rows[1].id,
        userResults.rows[2].id
      ]
    );

    console.log("🔗 URLs added:", urlResults.rows.length);

    // =======================
    // 4. Seed Click Records
    // =======================
    const clickData = [];

    const deviceTypes = ["Mobile", "Desktop", "Tablet"];
    const countries = ["IN", "US", "UK", "CA", "DE"];
    const referrers = [
      "https://google.com",
      "https://instagram.com",
      "https://facebook.com",
      null,
      "https://twitter.com"
    ];

    for (let url of urlResults.rows) {
      for (let i = 0; i < 20; i++) {
        clickData.push({
          url_id: url.id,
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          country: countries[Math.floor(Math.random() * countries.length)],
          device: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
          referrer: referrers[Math.floor(Math.random() * referrers.length)]
        });
      }
    }

    for (let click of clickData) {
      await db.query(
        `
        INSERT INTO clicks (url_id, ip_address, country, device_type, referrer)
        VALUES ($1, $2, $3, $4, $5);
        `,
        [click.url_id, click.ip, click.country, click.device, click.referrer]
      );
    }

    console.log("📊 Click analytics added:", clickData.length);

    console.log("✅ Database seeding complete!");
  } catch (err) {
    console.error("❌ Seeding error:", err);
  }
}

seed();
