import { jest, describe, test, expect, beforeEach } from "@jest/globals";

let UrlModelMock;
let ClickModelMock;

jest.unstable_mockModule("../../src/models/url.model.js", () => {
  UrlModelMock = {
    getUrlByShortCode: jest.fn(),
    incrementClick: jest.fn(),
  };
  return { UrlModel: UrlModelMock };
});

jest.unstable_mockModule("../../src/models/click.model.js", () => {
  ClickModelMock = {
    recordClick: jest.fn(),
  };
  return { ClickModel: ClickModelMock };
});

// Avoid dependency on geoip lookups during tests.
jest.unstable_mockModule("geoip-lite", () => ({
  default: { lookup: () => ({ country: "US" }) },
}));

// Avoid locale registration issues in i18n-iso-countries.
jest.unstable_mockModule("i18n-iso-countries", () => ({
  default: { getName: () => "United States" },
}));

const { ApiError } = await import("../../src/utils/ApiError.js");
const { redirectUrl } = await import("../../src/controllers/click.controller.js");

function makeRes() {
  const res = {
    status: jest.fn(() => res),
    json: jest.fn(() => res),
    redirect: jest.fn(() => res),
  };
  return res;
}

describe("Controller: click.controller.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("redirectUrl -> 400 when shortcode missing", async () => {
    const req = { params: {}, query: {}, headers: {}, socket: { remoteAddress: "" } };
    const res = makeRes();

    await expect(redirectUrl(req, res)).rejects.toBeInstanceOf(ApiError);
  });

  test("redirectUrl -> check=true returns JSON existence without redirect", async () => {
    UrlModelMock.getUrlByShortCode.mockResolvedValue({ id: 1 });

    const req = { params: { shortCode: "abc" }, query: { check: "true" }, headers: {}, socket: { remoteAddress: "" } };
    const res = makeRes();

    await redirectUrl(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test("redirectUrl -> 404 when short code not found", async () => {
    UrlModelMock.getUrlByShortCode.mockResolvedValue(null);

    const req = { params: { shortCode: "missing" }, query: {}, headers: {}, socket: { remoteAddress: "" } };
    const res = makeRes();

    await expect(redirectUrl(req, res)).rejects.toMatchObject({ statusCode: 404 });
  });

  test("redirectUrl -> redirects and records click", async () => {
    UrlModelMock.getUrlByShortCode.mockResolvedValue({ id: 123, original_url: "https://example.com" });

    const req = {
      params: { shortCode: "ok" },
      query: { ref: "twitter" },
      headers: { "user-agent": "Mobile Safari", "x-forwarded-for": "203.0.113.10" },
      socket: { remoteAddress: "203.0.113.10" },
    };

    const res = makeRes();

    await redirectUrl(req, res);

    expect(UrlModelMock.incrementClick).toHaveBeenCalledWith("ok");
    expect(ClickModelMock.recordClick).toHaveBeenCalledWith(
      123,
      expect.any(String),
      expect.any(String),
      "Mobile",
      "twitter"
    );
    expect(res.redirect).toHaveBeenCalledWith("https://example.com");
  });
});
