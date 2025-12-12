import { describe, test, expect } from "@jest/globals";

const { generateShortCode } = await import("../../src/utils/shortCodeGenerator.js");

describe("Utils: generateShortCode", () => {
  test("generates default length 6", () => {
    const code = generateShortCode();
    expect(code).toHaveLength(6);
  });

  test("generates specified length", () => {
    const code = generateShortCode(10);
    expect(code).toHaveLength(10);
  });

  test("generates only alphanumeric characters", () => {
    const code = generateShortCode(64);
    expect(code).toMatch(/^[A-Za-z0-9]+$/);
  });
});
