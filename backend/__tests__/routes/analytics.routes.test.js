import request from "supertest";
import { describe, test, expect, beforeAll, afterAll, afterEach } from "@jest/globals";

import {
  createTestContext,
  insertUser,
  insertUrl,
  insertClick,
  makeAuthToken,
  closeTestDB,
} from "../setup/setupTestEnv.js";

const { default: app } = await import("../../app.js");

describe("Routes: /api/analytics", () => {
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

  test("GET /api/analytics/:id/allclicks -> 200 returns click rows", async () => {
    const { user } = await insertUser(ctx);
    const token = makeAuthToken({ id: user.id, email: user.email });

    // short_code is VARCHAR(10) in the DB schema
    const url = await insertUrl(ctx, {
      userId: user.id,
      shortCode: `a${Date.now().toString().slice(-9)}`,
    });

    await insertClick(ctx, { urlId: url.id, deviceType: "Desktop", referrer: "Direct" });
    await insertClick(ctx, { urlId: url.id, deviceType: "Mobile", referrer: "twitter" });

    const res = await request(app)
      .get(`/api/analytics/${url.id}/allclicks`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.clicks)).toBe(true);
    expect(res.body.data.clicks.length).toBeGreaterThanOrEqual(2);
  });

  test("GET /api/analytics/:id/overview -> 200 returns overview (summary/daily/devices/countries/referrers)", async () => {
    const { user } = await insertUser(ctx);
    const token = makeAuthToken({ id: user.id, email: user.email });

    // short_code is VARCHAR(10) in the DB schema
    const url = await insertUrl(ctx, {
      userId: user.id,
      shortCode: `o${Date.now().toString().slice(-9)}`,
    });

    await insertClick(ctx, { urlId: url.id, country: "United States", deviceType: "Desktop", referrer: "Direct" });
    await insertClick(ctx, { urlId: url.id, country: "United States", deviceType: "Mobile", referrer: "twitter" });

    const res = await request(app)
      .get(`/api/analytics/${url.id}/overview`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const overview = res.body.data.overview;
    expect(overview).toHaveProperty("url");
    expect(overview).toHaveProperty("summary");
    expect(overview).toHaveProperty("daily");
    expect(overview).toHaveProperty("devices");
    expect(overview).toHaveProperty("countries");
    expect(overview).toHaveProperty("referrers");

    expect(Number(overview.summary.total_clicks)).toBeGreaterThanOrEqual(2);
    expect(Array.isArray(overview.devices)).toBe(true);
    expect(Array.isArray(overview.countries)).toBe(true);
    expect(Array.isArray(overview.referrers)).toBe(true);
  });

  test("GET /api/analytics/:id/clicksbydate -> 200 groups clicks by date", async () => {
    const { user } = await insertUser(ctx);
    const token = makeAuthToken({ id: user.id, email: user.email });

    // short_code is VARCHAR(10) in the DB schema
    const url = await insertUrl(ctx, {
      userId: user.id,
      shortCode: `b${Date.now().toString().slice(-9)}`,
    });

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

    await insertClick(ctx, { urlId: url.id, clickedAt: twoDaysAgo });
    await insertClick(ctx, { urlId: url.id, clickedAt: yesterday });

    const res = await request(app)
      .get(`/api/analytics/${url.id}/clicksbydate`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.clicksByDate)).toBe(true);
    expect(res.body.data.clicksByDate.length).toBeGreaterThanOrEqual(2);
  });

  test("GET /api/analytics/:id/overview -> 404 for invalid url id", async () => {
    const { user } = await insertUser(ctx);
    const token = makeAuthToken({ id: user.id, email: user.email });

    const res = await request(app)
      .get("/api/analytics/999999999/overview")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/analytics/stats -> 200 returns global stats (no auth)", async () => {
    const res = await request(app).get("/api/analytics/stats");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    expect(res.body.data).toHaveProperty("total_users");
    expect(res.body.data).toHaveProperty("total_urls");
    expect(res.body.data).toHaveProperty("total_clicks");
  });
});
