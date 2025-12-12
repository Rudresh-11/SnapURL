import { jest, describe, test, expect, beforeEach, afterEach } from "@jest/globals";

const { requestLogger } = await import("../../src/middlewares/requesthandler.middleware.js");

describe("Middleware: requestLogger", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  test("wraps res.json and stores body in res.locals.body", () => {
    const finishHandlers = [];

    const req = { method: "GET", originalUrl: "/x" };

    const res = {
      locals: {},
      statusCode: 200,
      json: jest.fn(function () {
        return res;
      }),
      on: jest.fn((event, cb) => {
        if (event === "finish") finishHandlers.push(cb);
      }),
    };

    const next = jest.fn();

    requestLogger(req, res, next);

    const body = { success: true, message: "ok" };
    res.json(body);

    expect(res.locals.body).toEqual(body);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.on).toHaveBeenCalledWith("finish", expect.any(Function));

    // Ensure finish handler doesn't crash.
    finishHandlers.forEach((fn) => fn());
  });
});
