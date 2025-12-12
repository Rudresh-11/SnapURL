import { describe, test, expect } from "@jest/globals";

const { ApiResponse } = await import("../../src/utils/ApiResponse.js");

describe("Utils: ApiResponse", () => {
  test("success is true for < 400", () => {
    const r = new ApiResponse(200, { a: 1 }, "ok");
    expect(r.success).toBe(true);
    expect(r.data).toEqual({ a: 1 });
  });

  test("success is false for >= 400", () => {
    const r = new ApiResponse(400, null, "bad");
    expect(r.success).toBe(false);
  });
});
