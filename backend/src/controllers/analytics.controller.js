import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ClickModel } from "../models/click.model.js";
import { UrlModel } from "../models/url.model.js";

async function getOwnedUrl(req) {
  const urlId = Number(req.params.id);

  if (!Number.isInteger(urlId) || urlId <= 0) {
    throw new ApiError(400, "Invalid URL id");
  }

  const url = await UrlModel.getUrlById(urlId);
  if (!url) throw new ApiError(404, "URL not found");

  if (url.user_id !== req.user?.id) {
    throw new ApiError(403, "Forbidden: You can only view your own links");
  }

  return url;
}

export const getClicksByUrl = async (req, res) => {
  const url = await getOwnedUrl(req);

  const clicks = await ClickModel.getTotalClicksByUrl(url.id);
  return res
    .status(200)
    .json(new ApiResponse(200, { clicks }, "Clicks retrieved successfully"));
};

export const getAnalyticsOverview = async (req, res) => {
  const url = await getOwnedUrl(req);

  const overview = await ClickModel.getOverview(url.id);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { overview },
        "Analytics overview retrieved successfully"
      )
    );
};

export const getClicksByDate = async (req, res) => {
  const url = await getOwnedUrl(req);

  const clicksByDate = await ClickModel.getClicksGroupedByDate(url.id);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { clicksByDate },
        "Clicks by date retrieved successfully"
      )
    );
};

export const getHomeStats = async (req, res) => {
  const stats = await ClickModel.getGlobalStats();
  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Home page stats retrieved successfully"));
};
