import "../src/config/loadEnv.js";
import bcrypt from "bcrypt";
import connectDB, { getDB } from "../src/config/db.js";

const SEED_PASSWORD = "password123";

const SEED_USERS = [
  { username: "rudresh", email: "rudresh@example.com" },
  { username: "john_doe", email: "john@example.com" },
  { username: "alice99", email: "alice@example.com" },
];

const SEED_URLS = [
  { originalUrl: "https://google.com", shortCode: "ggl123", alias: null, title: "Google" },
  { originalUrl: "https://youtube.com", shortCode: "ytb456", alias: null, title: "Youtube" },
  { originalUrl: "https://instagram.com", shortCode: "inst789", alias: "insta", title: "Instagram" },
];

const DEVICE_TYPES = ["Mobile", "Desktop", "Tablet"];
const COUNTRIES = ["India", "United States", "United Kingdom", "Canada", "Germany"];
const REFERRERS = [
  "https://google.com",
  "https://instagram.com",
  "https://facebook.com",
  "Direct",
  "https://twitter.com",
];

const CLICKS_PER_URL = 20;
const SPREAD_DAYS = 30;

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

async function seed() {
  await connectDB();
  const db = getDB();

  console.log("Seeding database...");

  const emails = SEED_USERS.map((u) => u.email);
  const del = await db.query("DELETE FROM users WHERE email = ANY($1::text[])", [emails]);
  console.log(`Cleared ${del.rowCount} existing seed user(s) and their links`);

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  const userRows = [];
  for (const user of SEED_USERS) {
    const res = await db.query(
      `INSERT INTO users (username, email, password_hash, provider)
       VALUES ($1, $2, $3, 'local')
       RETURNING id, username, email;`,
      [user.username, user.email, passwordHash]
    );
    userRows.push(res.rows[0]);
  }
  console.log(`Users added: ${userRows.length}`);

  const urlRows = [];
  for (let i = 0; i < SEED_URLS.length; i++) {
    const url = SEED_URLS[i];
    const res = await db.query(
      `INSERT INTO urls (user_id, original_url, short_code, custom_alias, expires_at, total_clicks, title)
       VALUES ($1, $2, $3, $4, NULL, 0, $5)
       RETURNING id, user_id, short_code;`,
      [userRows[i].id, url.originalUrl, url.shortCode, url.alias, url.title]
    );
    urlRows.push(res.rows[0]);
  }
  console.log(`URLs added: ${urlRows.length}`);

  let clickCount = 0;
  for (const url of urlRows) {
    for (let i = 0; i < CLICKS_PER_URL; i++) {
      const daysAgo = Math.floor(Math.random() * SPREAD_DAYS);
      const clickedAt = new Date();
      clickedAt.setDate(clickedAt.getDate() - daysAgo);
      clickedAt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);

      await db.query(
        `INSERT INTO clicks (url_id, ip_address, country, device_type, referrer, clicked_at)
         VALUES ($1, $2, $3, $4, $5, $6);`,
        [
          url.id,
          `192.168.1.${Math.floor(Math.random() * 255)}`,
          pick(COUNTRIES),
          pick(DEVICE_TYPES),
          pick(REFERRERS),
          clickedAt.toISOString(),
        ]
      );
      clickCount++;
    }
  }
  console.log(`Click analytics added: ${clickCount}`);

  await db.query(
    `UPDATE urls u
        SET total_clicks = (SELECT COUNT(*) FROM clicks c WHERE c.url_id = u.id)
      WHERE u.id = ANY($1::int[]);`,
    [urlRows.map((u) => u.id)]
  );

  console.log("Database seeding complete");
  console.log(`Sign in with ${SEED_USERS[0].email} / ${SEED_PASSWORD}`);
}

seed()
  .then(async () => {
    await getDB().end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("Seeding error:", err.message || err);
    try {
      await getDB().end();
    } catch {}
    process.exit(1);
  });
