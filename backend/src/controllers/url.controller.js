import { UrlModel } from "../models/url.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateShortCode } from "../utils/shortCodeGenerator.js";

// Create a new shortened URL
export const createUrl = async (req, res) => {
  try {
    const userId = req.user.id;
    const { originalUrl, customAlias, expiresAt } = req.body;
    let shortCode;

    if (customAlias) {
        const existingUrl = await UrlModel.getUrlByShortCode(customAlias);
        if (existingUrl) {
            throw new ApiError(409, "Custom alias already in use");
        }
        shortCode = customAlias;
    } else {
        shortCode = generateShortCode(6);
        let existingUrl = await UrlModel.getUrlByShortCode(shortCode);
        while (existingUrl) {
            shortCode = generateShortCode(6);
            existingUrl = await UrlModel.getUrlByShortCode(shortCode);
        }
    }

    const newUrl = await UrlModel.createUrl(userId, originalUrl, shortCode, customAlias, expiresAt);
    return res.status(201).json(
      new ApiResponse(201, newUrl, "Short URL created successfully")
    );
  } catch (error) {
    throw new ApiError(500, "URL creation failed", [error]);
  }

};

// Get all URLs for the authenticated user  
export const getUserUrls = async (req, res) => {
  try {
    const userId = req.user.id;
    const urls = await UrlModel.getUrlsByUser(userId);
    return res.status(200).json(
      new ApiResponse(200, urls, "User URLs fetched successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Failed to fetch user URLs", [error]);
  }
};

// Delete a URL by ID
export const deleteUrl = async (req, res) => {
  try {
    const urlId = req.params.id;
    const userId = req.user.id;
    const url = await UrlModel.getUrlById(urlId);

    if (!url) {
      throw new ApiError(404, "URL not found");
    }
    if (url.user_id !== userId) {
      throw new ApiError(403, "Forbidden: You can only delete your own URLs");
    }
    await UrlModel.deleteUrl(urlId);
    return res.status(200).json(
      new ApiResponse(200, null, "URL deleted successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Failed to delete URL", [error]);
  }
};

