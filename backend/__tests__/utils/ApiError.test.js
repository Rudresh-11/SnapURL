import { describe, test, expect } from "@jest/globals";

const { ApiError } = await import("../../src/utils/ApiError.js");

describe("Utils: ApiError", () => {
  test("constructs with statusCode/message and sets success=false", () => {
    const err = new ApiError(400, "Bad request", ["x"]);

    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe("Bad request");
    expect(err.success).toBe(false);
    expect(err.errors).toEqual(["x"]);
  });
});
