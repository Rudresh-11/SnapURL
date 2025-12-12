import request from "supertest";
import { describe, test, expect } from "@jest/globals";

const { default: app } = await import("../../app.js");

describe("Route: /api/test", () => {
  test("GET /api/test -> 200 returns ApiResponse payload", async () => {
    const res = await request(app).get("/api/test");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("data");
  });
});
