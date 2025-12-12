import request from "supertest";
import { jest, describe, test, expect, beforeAll, afterAll, afterEach } from "@jest/globals";

import {
  createTestContext,
  insertUser,
  makeAuthToken,
  closeTestDB,
} from "../setup/setupTestEnv.js";

// --- Mock Google OAuth verification globally for this test file ---
let verifyIdTokenMock;

jest.unstable_mockModule("google-auth-library", () => {
  verifyIdTokenMock = jest.fn();

  class OAuth2Client {
    constructor() {}
    verifyIdToken(...args) {
      return verifyIdTokenMock(...args);
    }
  }

  return { OAuth2Client };
});

const { default: app } = await import("../../app.js");

describe("Routes: /api/auth", () => {
  let ctx;

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  afterEach(async () => {
    await ctx.cleanup();
    verifyIdTokenMock?.mockReset();
  });

  afterAll(async () => {
    await ctx.cleanup();
    await closeTestDB();
  });

  test("POST /api/auth/register -> 400 when required fields missing", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "",
      username: "",
      password: "",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/auth/register -> 200 + sets cookies", async () => {
    const email = `reg_${Date.now()}_${process.pid}@example.com`;
    const username = `reg_${Date.now()}_${process.pid}`;

    const res = await request(app).post("/api/auth/register").send({
      email,
      username,
      password: "Password123!",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("accessToken");
    expect(res.body.data).toHaveProperty("refreshToken");
    expect(res.headers["set-cookie"]?.join(";") || "").toMatch(/accessToken=/);

    // Track inserted user so it is cleaned up.
    const dbUser = await ctx.db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (dbUser.rows[0]?.id) ctx.userIds.push(dbUser.rows[0].id);
  });

  test("POST /api/auth/register -> 409 for duplicate email", async () => {
    const { user } = await insertUser(ctx, { email: `dup_${Date.now()}@example.com` });

    const res = await request(app).post("/api/auth/register").send({
      email: user.email,
      username: `another_${Date.now()}`,
      password: "Password123!",
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/auth/login -> 401 for unknown user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: `missing_${Date.now()}@example.com`,
      password: "Password123!",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/auth/login -> 401 for invalid password", async () => {
    const { user } = await insertUser(ctx, { password: "CorrectPassword!" });

    const res = await request(app).post("/api/auth/login").send({
      email: user.email,
      password: "WrongPassword!",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/auth/login -> 401 when provider is google", async () => {
    const { user } = await insertUser(ctx, {
      provider: "google",
      googleId: `gid_${Date.now()}`,
    });

    const res = await request(app).post("/api/auth/login").send({
      email: user.email,
      password: "anything",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Login with google/i);
  });

  test("POST /api/auth/login -> 200 + sets cookies on success", async () => {
    const password = "Password123!";
    const { user } = await insertUser(ctx, { password, provider: "local" });

    const res = await request(app).post("/api/auth/login").send({
      email: user.email,
      password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers["set-cookie"]?.join(";") || "").toMatch(/accessToken=/);
  });

  test("POST /api/auth/login/google -> 401 when provider missing", async () => {
    const res = await request(app).post("/api/auth/login/google").send({
      idToken: "fake",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/auth/login/google -> 401 when provider != google", async () => {
    const res = await request(app).post("/api/auth/login/google").send({
      provider: "github",
      idToken: "fake",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/auth/login/google -> 400 when idToken missing", async () => {
    const res = await request(app).post("/api/auth/login/google").send({
      provider: "google",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/auth/login/google -> 401 when Google token invalid", async () => {
    verifyIdTokenMock.mockImplementation(() => {
      throw new Error("bad token");
    });

    const res = await request(app).post("/api/auth/login/google").send({
      provider: "google",
      idToken: "invalid",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/auth/login/google -> 201 for new Google user registration", async () => {
    const email = `google_new_${Date.now()}@example.com`;

    verifyIdTokenMock.mockResolvedValue({
      getPayload: () => ({
        sub: `sub_${Date.now()}`,
        email,
        name: "Google User",
      }),
    });

    const res = await request(app).post("/api/auth/login/google").send({
      provider: "google",
      idToken: "valid",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const dbUser = await ctx.db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (dbUser.rows[0]?.id) ctx.userIds.push(dbUser.rows[0].id);
  });

  test("POST /api/auth/login/google -> 200 for existing Google user", async () => {
    const email = `google_existing_${Date.now()}@example.com`;
    const { user } = await insertUser(ctx, {
      provider: "google",
      googleId: `gid_${Date.now()}`,
      email,
    });

    verifyIdTokenMock.mockResolvedValue({
      getPayload: () => ({ sub: user.google_id, email: user.email, name: "Existing" }),
    });

    const res = await request(app).post("/api/auth/login/google").send({
      provider: "google",
      idToken: "valid",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("POST /api/auth/login/google -> 400 when email exists as local user", async () => {
    const email = `local_then_google_${Date.now()}@example.com`;
    const { user } = await insertUser(ctx, { provider: "local", email });

    verifyIdTokenMock.mockResolvedValue({
      getPayload: () => ({ sub: `sub_${Date.now()}`, email: user.email, name: "Local User" }),
    });

    const res = await request(app).post("/api/auth/login/google").send({
      provider: "google",
      idToken: "valid",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/auth/me -> 401 for missing token", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/auth/me -> 200 for valid token", async () => {
    const { user } = await insertUser(ctx, { provider: "local" });
    const token = makeAuthToken({ id: user.id, email: user.email });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(user.email);
  });

  test("POST /api/auth/logout -> 200 clears refresh token (DB) when authenticated", async () => {
    const { user } = await insertUser(ctx, { provider: "local", refreshToken: "rt" });
    const token = makeAuthToken({ id: user.id, email: user.email });

    const res = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const refreshed = await ctx.db.query("SELECT refresh_token FROM users WHERE id = $1", [user.id]);
    expect(refreshed.rows[0].refresh_token).toBe(null);
  });
});
