import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ClickModel } from "../models/click.model.js";
import { UrlModel } from "../models/url.model.js";

export const getClicksByUrl = async (req, res, next) => {
    try {
        const urlId = req.params.id;
        const url = await UrlModel.getUrlById(urlId);
        if (!url) {
            throw new ApiError(404, "URL not found");
        }
        const clicks = await ClickModel.getTotalClicksByUrl(urlId);
        return res.status(200).json(new ApiResponse(200, { clicks }, "Clicks retrieved successfully"));
    } catch (error) {
        console.log(error);
        
        throw new ApiError(500, "Failed to retrieve clicks", [error]);
        next(error);
    }
};

export const getAnalyticsOverview = async (req, res, next) => {
        const urlId = req.params.id;
        const url = await UrlModel.getUrlById(urlId);
        if (!url) {
            throw new ApiError(404, "URL not found");
        }
        try {
        const overview = await ClickModel.getOverview(urlId);
        return res.status(200).json(new ApiResponse(200, { overview }, "Analytics overview retrieved successfully"));
    }
    catch (error) {
        throw new ApiError(500, "Failed to retrieve analytics overview", [error]);
        next(error);
    }
};

export const getClicksByDate = async (req, res, next) => {
        const urlId = req.params.id;
        const url = await UrlModel.getUrlById(urlId);
        if (!url) {
            throw new ApiError(404, "URL not found");
        }
        try {
            const clicksByDate = await ClickModel.getClicksGroupedByDate(urlId);
            return res.status(200).json(new ApiResponse(200, { clicksByDate }, "Clicks by date retrieved successfully"));
        } catch (error) {
            throw new ApiError(500, "Failed to retrieve clicks by date", [error]);
        }
};

export const getHomeStats = async (req, res, next) => {
  try {
    // throw new ApiError(500, "Force error")
    const stats = await ClickModel.getGlobalStats();
    return res.status(200).json(
      new ApiResponse(200, stats, "Home page stats retrieved successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Failed to retrieve home stats", [error]);
  }
};
