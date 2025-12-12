import { jest, describe, test, expect } from "@jest/globals";

let launchMock;

jest.unstable_mockModule("puppeteer", () => {
  launchMock = jest.fn();
  return {
    default: {
      launch: (...args) => launchMock(...args),
    },
  };
});

const { fetchMetadata } = await import("../../src/utils/fetchMeta.js");

describe("Utils: fetchMetadata", () => {
  test("returns metadata from mocked page.evaluate", async () => {
    launchMock.mockResolvedValue({
      newPage: async () => ({
        setUserAgent: async () => {},
        goto: async () => {},
        evaluate: async () => ({ title: "T", description: "D", image: null, favicon: null }),
      }),
      close: async () => {},
    });

    const md = await fetchMetadata("https://example.com");

    expect(md).toEqual(expect.objectContaining({ title: "T" }));
    expect(launchMock).toHaveBeenCalledTimes(1);
  });
});
