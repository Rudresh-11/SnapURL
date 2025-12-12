import request from "supertest";
import { jest, describe, test, expect, beforeAll, afterAll, afterEach } from "@jest/globals";

import {
  createTestContext,
  insertUser,
  insertUrl,
  makeAuthToken,
  closeTestDB,
} from "../setup/setupTestEnv.js";

// Mock puppeteer so /api/url/metadata doesn't spin up a real browser in tests.
let launchMock;

jest.unstable_mockModule("puppeteer", () => {
  launchMock = jest.fn();
  return {
    default: {
      launch: (...args) => launchMock(...args),
    },
  };
});

const { default: app } = await import("../../app.js");

describe("Routes: /api/url", () => {
  let ctx;

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  afterEach(async () => {
    await ctx.cleanup();
    launchMock?.mockReset();
  });

  afterAll(async () => {
    await ctx.cleanup();
    await closeTestDB();
  });

  test("POST /api/url/shorten -> 401 when missing token", async () => {
    const res = await request(app).post("/api/url/shorten").send({
      originalUrl: "https://example.com",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/url/shorten -> 401 when token is invalid", async () => {
    const res = await request(app)
      .post("/api/url/shorten")
      .set("Authorization", "Bearer not-a-jwt")
      .send({ originalUrl: "https://example.com" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/url/shorten -> 401 when token is expired (mocked via expiresIn)", async () => {
    const { user } = await insertUser(ctx);
    const expiredToken = makeAuthToken({ id: user.id, email: user.email }, { expiresIn: "-1s" });

    const res = await request(app)
      .post("/api/url/shorten")
      .set("Authorization", `Bearer ${expiredToken}`)
      .send({ originalUrl: "https://example.com" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/url/shorten -> 400 when originalUrl missing", async () => {
    const { user } = await insertUser(ctx);
    const token = makeAuthToken({ id: user.id, email: user.email });

    const res = await request(app)
      .post("/api/url/shorten")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/url/shorten -> 403 when customAlias is 'api'", async () => {
    const { user } = await insertUser(ctx);
    const token = makeAuthToken({ id: user.id, email: user.email });

    const res = await request(app)
      .post("/api/url/shorten")
      .set("Authorization", `Bearer ${token}`)
      .send({ originalUrl: "https://example.com", customAlias: "api" });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/url/shorten -> 409 when customAlias already exists", async () => {
    const { user } = await insertUser(ctx);
    const token = makeAuthToken({ id: user.id, email: user.email });

    const alias = `dup_${Math.random().toString(36).slice(2, 8)}`;
    await insertUrl(ctx, { userId: user.id, shortCode: alias, customAlias: alias });

    const res = await request(app)
      .post("/api/url/shorten")
      .set("Authorization", `Bearer ${token}`)
      .send({ originalUrl: "https://example.com", customAlias: alias });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/url/shorten -> 201 for valid customAlias", async () => {
    const { user } = await insertUser(ctx);
    const token = makeAuthToken({ id: user.id, email: user.email });

    const alias = `ok_${Math.random().toString(36).slice(2, 8)}`;

    const res = await request(app)
      .post("/api/url/shorten")
      .set("Authorization", `Bearer ${token}`)
      .send({ originalUrl: "https://example.com", customAlias: alias });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.short_code).toBe(alias);

    // Track created URL for cleanup if controller didn't already.
    const dbUrl = await ctx.db.query("SELECT id FROM urls WHERE short_code = $1", [alias]);
    if (dbUrl.rows[0]?.id) ctx.urlIds.push(dbUrl.rows[0].id);
  });

  test("POST /api/url/shorten -> 201 generates random short_code when alias absent", async () => {
    const { user } = await insertUser(ctx);
    const token = makeAuthToken({ id: user.id, email: user.email });

    const res = await request(app)
      .post("/api/url/shorten")
      .set("Authorization", `Bearer ${token}`)
      .send({ originalUrl: "https://example.com" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.short_code).toHaveLength(6);

    ctx.urlIds.push(res.body.data.id);
  });

  test("POST /api/url/demoshorten -> 400 when originalUrl missing", async () => {
    const res = await request(app).post("/api/url/demoshorten").send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/url/demoshorten -> 201 creates url with user_id null", async () => {
    const res = await request(app).post("/api/url/demoshorten").send({
      originalUrl: "https://example.com",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const urlId = res.body.data.id;
    ctx.urlIds.push(urlId);

    const row = await ctx.db.query("SELECT user_id FROM urls WHERE id = $1", [urlId]);
    expect(row.rows[0].user_id).toBe(null);
  });

  test("GET /api/url/get -> 200 returns user urls (auth required)", async () => {
    const { user } = await insertUser(ctx);
    const token = makeAuthToken({ id: user.id, email: user.email });

    // short_code is VARCHAR(10) in the DB schema
    const u1 = await insertUrl(ctx, {
      userId: user.id,
      shortCode: `a${Date.now().toString().slice(-9)}`,
    });
    const u2 = await insertUrl(ctx, {
      userId: user.id,
      shortCode: `b${Date.now().toString().slice(-9)}`,
    });

    const res = await request(app)
      .get("/api/url/get")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    const ids = res.body.data.map((r) => r.id);
    expect(ids).toEqual(expect.arrayContaining([u1.id, u2.id]));
  });

  test("DELETE /api/url/delete/:id -> 200 deletes url when owned by user", async () => {
    const { user } = await insertUser(ctx);
    const token = makeAuthToken({ id: user.id, email: user.email });

    // short_code is VARCHAR(10) in the DB schema
    const url = await insertUrl(ctx, {
      userId: user.id,
      shortCode: `d${Date.now().toString().slice(-9)}`,
    });

    const res = await request(app)
      .delete(`/api/url/delete/${url.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const check = await ctx.db.query("SELECT id FROM urls WHERE id = $1", [url.id]);
    expect(check.rows.length).toBe(0);
  });

  test("DELETE /api/url/delete/:id -> 500 for non-existent url (controller wraps errors)", async () => {
    const { user } = await insertUser(ctx);
    const token = makeAuthToken({ id: user.id, email: user.email });

    const res = await request(app)
      .delete("/api/url/delete/999999999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("DELETE /api/url/delete/:id -> 500 when deleting someone else's url (controller wraps errors)", async () => {
    const { user: owner } = await insertUser(ctx);
    const { user: attacker } = await insertUser(ctx);

    const token = makeAuthToken({ id: attacker.id, email: attacker.email });

    // short_code is VARCHAR(10) in the DB schema
    const url = await insertUrl(ctx, {
      userId: owner.id,
      shortCode: `f${Date.now().toString().slice(-9)}`,
    });

    const res = await request(app)
      .delete(`/api/url/delete/${url.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/url/metadata -> 200 returns title (puppeteer mocked)", async () => {
    launchMock.mockResolvedValue({
      newPage: async () => ({
        setUserAgent: async () => {},
        goto: async () => {},
        evaluate: async () => ({ title: "Example Title" }),
      }),
      close: async () => {},
    });

    const res = await request(app).post("/api/url/metadata").send({
      url: "https://example.com",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Example Title");
  });

  test("POST /api/url/metadata -> 500 when puppeteer fails", async () => {
    launchMock.mockImplementation(() => {
      throw new Error("puppeteer failure");
    });

    const res = await request(app).post("/api/url/metadata").send({
      url: "https://example.com",
    });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
