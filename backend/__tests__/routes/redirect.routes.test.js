import request from "supertest";
import { describe, test, expect, beforeAll, afterAll, afterEach } from "@jest/globals";

import {
  createTestContext,
  insertUrl,
  closeTestDB,
} from "../setup/setupTestEnv.js";

const { default: app } = await import("../../app.js");

describe("Routes: redirect (/)", () => {
  let ctx;

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  afterEach(async () => {
    await ctx.cleanup();
  });

  afterAll(async () => {
    await ctx.cleanup();
    await closeTestDB();
  });

  test("GET / -> 400 'Shortcode required'", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(400);
    expect(res.text).toMatch(/Shortcode required/i);
  });

  test("GET /:shortCode?check=true -> 200 when url exists", async () => {
    const url = await insertUrl(ctx, {
      shortCode: `chk_${Math.random().toString(36).slice(2, 8)}`,
      originalUrl: "https://example.com",
    });

    const res = await request(app).get(`/${url.short_code}?check=true`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.exist).toBe(true);
  });

  test("GET /:shortCode?check=true -> 404 when url does not exist", async () => {
    const res = await request(app).get("/does_not_exist?check=true");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("GET /:shortCode -> 302 redirects + creates click + increments total_clicks", async () => {
    const shortCode = `go_${Math.random().toString(36).slice(2, 8)}`;
    const originalUrl = "https://example.com";

    const url = await insertUrl(ctx, { shortCode, originalUrl, totalClicks: 0 });

    const res = await request(app)
      .get(`/${shortCode}?ref=twitter`)
      .set("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
      .set("cf-ipcountry", "US")
      .set("x-forwarded-for", "203.0.113.55");

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(originalUrl);

    const urlRow = await ctx.db.query("SELECT total_clicks FROM urls WHERE id = $1", [url.id]);
    expect(Number(urlRow.rows[0].total_clicks)).toBe(1);

    const clickRows = await ctx.db.query(
      "SELECT * FROM clicks WHERE url_id = $1 ORDER BY clicked_at DESC LIMIT 1",
      [url.id]
    );

    expect(clickRows.rows.length).toBe(1);
    expect(clickRows.rows[0].referrer).toBe("twitter");
    expect(clickRows.rows[0].device_type).toBe("Desktop");
  });

  test("GET /:shortCode -> 404 when short code not found", async () => {
    const res = await request(app).get("/no_such_code");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
