import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { describe, test, expect } from "@jest/globals";

import connectDB, { getDB } from "../../src/config/db.js";

const PROJECT_ROOT = path.resolve(process.cwd());

export function loadTestEnv() {
  if (globalThis.__SNAPURL_TEST_ENV_LOADED__) return;

  const envTestPath = path.join(PROJECT_ROOT, ".env.test");
  const envPath = path.join(PROJECT_ROOT, ".env");

  if (fs.existsSync(envTestPath)) {
    dotenv.config({ path: envTestPath, override: true });
  } else if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }

  // Ensure tests never sleep for 20s due to renderDelay middleware.
  process.env.RENDER_DELAY = "false";

  // Defaults for tests (can be overridden by .env.test)
  process.env.JWT_SECRET ||= "test_jwt_secret";
  process.env.CORS_ORIGIN ||= "http://localhost:3000";

  globalThis.__SNAPURL_TEST_ENV_LOADED__ = true;
}

export async function initTestDB() {
  loadTestEnv();

  if (globalThis.__SNAPURL_TEST_DB_INITIALIZED__) return getDB();

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Create a .env.test with DATABASE_URL for a dedicated test database."
    );
  }

  await connectDB();
  globalThis.__SNAPURL_TEST_DB_INITIALIZED__ = true;
  return getDB();
}

export async function closeTestDB() {
  if (!globalThis.__SNAPURL_TEST_DB_INITIALIZED__) return;

  try {
    const db = getDB();
    await db.end();
  } finally {
    globalThis.__SNAPURL_TEST_DB_INITIALIZED__ = false;
  }
}

export function makeAuthToken({ id, email }, opts = {}) {
  const { expiresIn = "1h" } = opts;
  return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn });
}

export function makeUniqueEmail(prefix = "jest") {
  const rand = Math.random().toString(16).slice(2);
  return `${prefix}_${Date.now()}_${process.pid}_${rand}@example.com`;
}

export function makeUniqueUsername(prefix = "jest") {
  const rand = Math.random().toString(16).slice(2);
  return `${prefix}_${Date.now()}_${process.pid}_${rand}`;
}

export async function createTestContext() {
  const db = await initTestDB();

  const ctx = {
    db,
    userIds: [],
    urlIds: [],
    clickIds: [],
    async cleanup() {
      // Delete in FK-safe order.
      if (this.clickIds.length) {
        await db.query("DELETE FROM clicks WHERE id = ANY($1::int[])", [this.clickIds]);
        this.clickIds = [];
      }

      if (this.urlIds.length) {
        await db.query("DELETE FROM urls WHERE id = ANY($1::int[])", [this.urlIds]);
        this.urlIds = [];
      }

      if (this.userIds.length) {
        await db.query("DELETE FROM users WHERE id = ANY($1::int[])", [this.userIds]);
        this.userIds = [];
      }
    },
  };

  return ctx;
}

export async function insertUser(ctx, overrides = {}) {
  const {
    username = makeUniqueUsername(),
    email = makeUniqueEmail(),
    password = "P@ssw0rd123!",
    provider = "local",
    googleId = null,
    refreshToken = null,
  } = overrides;

  const passwordHash = provider === "local" ? await bcrypt.hash(password, 10) : null;

  const result = await ctx.db.query(
    `
    INSERT INTO users (username, email, password_hash, provider, google_id, refresh_token)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
    `,
    [username, email, passwordHash, provider, googleId, refreshToken]
  );

  const user = result.rows[0];
  ctx.userIds.push(user.id);
  return { user, password };
}

export async function insertUrl(ctx, overrides = {}) {
  const {
    userId = null,
    originalUrl = "https://example.com",
    shortCode = `t${Math.random().toString(36).slice(2, 8)}`,
    customAlias = null,
    expiresAt = null,
    totalClicks = 0,
    title = "Untitled",
  } = overrides;

  const result = await ctx.db.query(
    `
    INSERT INTO urls (user_id, original_url, short_code, custom_alias, expires_at, total_clicks, title)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
    `,
    [userId, originalUrl, shortCode, customAlias, expiresAt, totalClicks, title]
  );

  const url = result.rows[0];
  ctx.urlIds.push(url.id);
  return url;
}

export async function insertClick(ctx, overrides = {}) {
  const {
    urlId,
    ipAddress = "203.0.113.10",
    country = "Unknown",
    deviceType = "Desktop",
    referrer = "Direct",
    clickedAt = null,
  } = overrides;

  if (!urlId) throw new Error("insertClick requires urlId");

  const result = await ctx.db.query(
    `
    INSERT INTO clicks (url_id, ip_address, country, device_type, referrer, clicked_at)
    VALUES ($1, $2, $3, $4, $5, COALESCE($6, NOW()))
    RETURNING *;
    `,
    [urlId, ipAddress, country, deviceType, referrer, clickedAt]
  );

  const click = result.rows[0];
  ctx.clickIds.push(click.id);
  return click;
}

// Jest will discover this file via __tests__/**.js. Keep a tiny test so Jest doesn't error.
describe("__tests__/setup/setupTestEnv.js", () => {
  test("loads without crashing", () => {
    loadTestEnv();
    expect(typeof process.env.JWT_SECRET).toBe("string");
  });
});
