import { jest, describe, test, expect, beforeEach } from "@jest/globals";

let UrlModelMock;
let ClickModelMock;

jest.unstable_mockModule("../../src/models/url.model.js", () => {
  UrlModelMock = {
    getUrlById: jest.fn(),
  };
  return { UrlModel: UrlModelMock };
});

jest.unstable_mockModule("../../src/models/click.model.js", () => {
  ClickModelMock = {
    getTotalClicksByUrl: jest.fn(),
    getOverview: jest.fn(),
    getClicksGroupedByDate: jest.fn(),
    getGlobalStats: jest.fn(),
  };
  return { ClickModel: ClickModelMock };
});

const { ApiError } = await import("../../src/utils/ApiError.js");
const analyticsController = await import("../../src/controllers/analytics.controller.js");

function makeRes() {
  const res = {
    status: jest.fn(() => res),
    json: jest.fn(() => res),
  };
  return res;
}

describe("Controller: analytics.controller.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getClicksByUrl -> 404 when url missing", async () => {
    UrlModelMock.getUrlById.mockResolvedValue(null);

    const req = { params: { id: "1" }, user: { id: 7 } };
    const res = makeRes();

    await expect(analyticsController.getClicksByUrl(req, res)).rejects.toBeInstanceOf(ApiError);
  });

  test("getClicksByUrl -> 200 returns clicks", async () => {
    UrlModelMock.getUrlById.mockResolvedValue({ id: 1, user_id: 7 });
    ClickModelMock.getTotalClicksByUrl.mockResolvedValue([{ id: 1 }]);

    const req = { params: { id: "1" }, user: { id: 7 } };
    const res = makeRes();

    await analyticsController.getClicksByUrl(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test("getAnalyticsOverview -> 200 returns overview", async () => {
    UrlModelMock.getUrlById.mockResolvedValue({ id: 1, user_id: 7 });
    ClickModelMock.getOverview.mockResolvedValue({ summary: { total_clicks: "0" } });

    const req = { params: { id: "1" }, user: { id: 7 } };
    const res = makeRes();

    await analyticsController.getAnalyticsOverview(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test("getClicksByDate -> 200 returns grouped clicks", async () => {
    UrlModelMock.getUrlById.mockResolvedValue({ id: 1, user_id: 7 });
    ClickModelMock.getClicksGroupedByDate.mockResolvedValue([{ date: "2025-01-01", clicks: "2" }]);

    const req = { params: { id: "1" }, user: { id: 7 } };
    const res = makeRes();

    await analyticsController.getClicksByDate(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test("getClicksByUrl -> 403 when the url belongs to someone else", async () => {
    UrlModelMock.getUrlById.mockResolvedValue({ id: 1, user_id: 7 });

    const req = { params: { id: "1" }, user: { id: 99 } };
    const res = makeRes();

    await expect(
      analyticsController.getClicksByUrl(req, res)
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(ClickModelMock.getTotalClicksByUrl).not.toHaveBeenCalled();
  });

  test("getAnalyticsOverview -> 403 when the url belongs to someone else", async () => {
    UrlModelMock.getUrlById.mockResolvedValue({ id: 1, user_id: 7 });

    const req = { params: { id: "1" }, user: { id: 99 } };
    const res = makeRes();

    await expect(
      analyticsController.getAnalyticsOverview(req, res)
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(ClickModelMock.getOverview).not.toHaveBeenCalled();
  });

  test("getClicksByDate -> 403 when the url belongs to someone else", async () => {
    UrlModelMock.getUrlById.mockResolvedValue({ id: 1, user_id: 7 });

    const req = { params: { id: "1" }, user: { id: 99 } };
    const res = makeRes();

    await expect(
      analyticsController.getClicksByDate(req, res)
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test("getClicksByUrl -> 400 on a non-numeric id", async () => {
    const req = { params: { id: "abc" }, user: { id: 7 } };
    const res = makeRes();

    await expect(
      analyticsController.getClicksByUrl(req, res)
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(UrlModelMock.getUrlById).not.toHaveBeenCalled();
  });

  test("getHomeStats -> 200 returns global stats", async () => {
    ClickModelMock.getGlobalStats.mockResolvedValue({ total_users: "1", total_urls: "2", total_clicks: "3" });

    const req = {};
    const res = makeRes();

    await analyticsController.getHomeStats(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
