import { describe, test, expect, beforeEach, afterEach, jest } from "@jest/globals";

const { renderDelay } = await import("../../src/middlewares/renderDelay.middleware.js");

describe("Middleware: renderDelay", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    delete process.env.RENDER_DELAY;
  });

  test("calls next immediately when RENDER_DELAY != 'true'", () => {
    process.env.RENDER_DELAY = "false";

    const next = jest.fn();
    renderDelay({}, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  test("delays next by ~20000ms when RENDER_DELAY == 'true'", () => {
    process.env.RENDER_DELAY = "true";

    const next = jest.fn();
    renderDelay({}, {}, next);

    expect(next).not.toHaveBeenCalled();

    jest.advanceTimersByTime(19999);
    expect(next).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
