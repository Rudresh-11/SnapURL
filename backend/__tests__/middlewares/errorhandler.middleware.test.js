import { jest, describe, test, expect } from "@jest/globals";

const { ApiError } = await import("../../src/utils/ApiError.js");
const { errorHandler } = await import("../../src/middlewares/errorhandler.middleware.js");

function makeRes() {
  const res = {
    statusCode: 200,
    status: jest.fn((code) => {
      res.statusCode = code;
      return res;
    }),
    json: jest.fn(() => res),
  };
  return res;
}

describe("Middleware: errorHandler", () => {
  test("returns ApiError payload + statusCode", () => {
    const err = new ApiError(401, "Unauthorized");
    const req = {};
    const res = makeRes();
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "Unauthorized" })
    );
  });

  test("returns 500 for generic error", () => {
    const err = new Error("Boom");
    const req = {};
    const res = makeRes();
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "Internal server error" })
    );
  });
});
