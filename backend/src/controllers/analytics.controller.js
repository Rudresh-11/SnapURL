import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ClickModel } from "../models/click.model.js";
import { UrlModel } from "../models/url.model.js";

export const getClicksByUrl = async (req, res, next) => {
    try {
        const urlId = req.params.id;
        const clicks = await ClickModel.getTotalClicksByUrl(urlId);
        return res.status(200).json(new ApiResponse(200, { clicks }, "Clicks retrieved successfully"));
    } catch (error) {
        throw new ApiError(500, "Failed to retrieve clicks", [error]);
        next(error);
    }
};

export const getCountsByUrl = async (req, res, next) => {
    try {
        const urlId = req.params.id;
        const analytics = await ClickModel.getCountsByUrl(urlId);
        res.status(200).json(new ApiResponse(200, { counts }, "Counts retrieved successfully"));
    } catch (error) {
        console.log(error);

        throw new ApiError(500, "Failed to retrieve counts", [error]);
        next(error);
    }
};

export const getCountryStats = async (req, res, next) => {
    try {
        const urlId = req.params.id;
        const countryStats = await ClickModel.getCountryStats(urlId);
        res.status(200).json(new ApiResponse(200, { countryStats }, "Country stats retrieved successfully"));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Failed to retrieve country stats", [error]);
        next(error);
    }
}

export const getDeviceStats = async (req, res, next) => {
    try {
        const urlId = req.params.id;
        const deviceStats = await ClickModel.getDeviceStats(urlId);
        res.status(200).json(new ApiResponse(200, { deviceStats }, "Device stats retrieved successfully"));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Failed to retrieve device stats", [error]);
        next(error);
    }
}

export const getReferrerStats = async (req, res, next) => {
    try {
        const urlId = req.params.id;
        const referrerStats = await ClickModel.getReferrerStats(urlId);
        res.status(200).json(new ApiResponse(200, { referrerStats }, "Referrer stats retrieved successfully"));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Failed to retrieve referrer stats", [error]);
        next(error);
    }
}

