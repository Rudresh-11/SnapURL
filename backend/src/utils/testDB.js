import 'dotenv/config';
import connectDB from "../config/db.js";

async function testDB() {
  const pool = await connectDB();

  try {
    console.log("🔧 Creating large test table...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS test_big (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        age INT,
        is_active BOOLEAN DEFAULT true,
        balance NUMERIC(10,2),
        preferences JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Table structure ready");

    console.log("🧩 Inserting 20 sample rows...");

    await pool.query(`
      INSERT INTO test_big (username, email, age, balance, preferences)
      VALUES
        ('rudresh', 'rudresh@example.com', 21, 5200.75, '{"theme":"dark","notifications":true}'),
        ('alex', 'alex@example.com', 25, 7000.10, '{"theme":"light","notifications":false}'),
        ('sam', 'sam@example.com', 30, 15000.00, '{"theme":"dark","notifications":true}'),
        ('tina', 'tina@example.com', 28, 9800.00, '{"theme":"light","notifications":true}'),
        ('rohit', 'rohit@example.com', 23, 4100.50, '{"theme":"dark","notifications":false}'),
        ('nisha', 'nisha@example.com', 27, 12500.20, '{"theme":"light","notifications":true}'),
        ('mark', 'mark@example.com', 33, 8900.00, '{"theme":"dark","notifications":true}'),
        ('anita', 'anita@example.com', 29, 11000.60, '{"theme":"light","notifications":false}'),
        ('vivek', 'vivek@example.com', 24, 7200.75, '{"theme":"dark","notifications":true}'),
        ('riya', 'riya@example.com', 26, 6300.30, '{"theme":"light","notifications":false}'),
        ('dev', 'dev@example.com', 31, 15200.00, '{"theme":"dark","notifications":true}'),
        ('kiran', 'kiran@example.com', 22, 4200.00, '{"theme":"light","notifications":true}'),
        ('arjun', 'arjun@example.com', 27, 9800.00, '{"theme":"dark","notifications":true}'),
        ('meera', 'meera@example.com', 28, 10300.50, '{"theme":"light","notifications":false}'),
        ('rahul', 'rahul@example.com', 32, 8700.90, '{"theme":"dark","notifications":true}'),
        ('neha', 'neha@example.com', 25, 6900.10, '{"theme":"light","notifications":true}'),
        ('yash', 'yash@example.com', 29, 8400.40, '{"theme":"dark","notifications":false}'),
        ('pallavi', 'pallavi@example.com', 30, 9100.25, '{"theme":"light","notifications":true}'),
        ('sagar', 'sagar@example.com', 26, 7600.55, '{"theme":"dark","notifications":true}'),
        ('isha', 'isha@example.com', 23, 8800.00, '{"theme":"light","notifications":true}')
      ON CONFLICT (email) DO NOTHING;
    `);

    console.log("✅ 20 rows inserted (duplicates skipped if already present)");

    const result = await pool.query(`SELECT COUNT(*) AS total_rows FROM test_big;`);
    console.log(`📊 Total rows in table: ${result.rows[0].total_rows}`);

    console.log("✅ Done. Check pgAdmin → Tables → test_big → View Data");

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await pool.end();
  }
}

testDB();
