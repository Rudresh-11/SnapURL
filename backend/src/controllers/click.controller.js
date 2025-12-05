import { UrlModel } from "../models/url.model.js";
import { ClickModel } from "../models/click.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import geoip from "geoip-lite";




export const redirectUrl = async (req, res) => {
    try {
        const shortCode = req.params.shortCode;
        if (!shortCode) {
            throw new ApiError(400, "Shortcode is required");
        }
        const url = await UrlModel.getUrlByShortCode(shortCode);
        if (!url) {
            throw new ApiError(404, "URL not found");
        }
        await UrlModel.incrementClick(shortCode);

        const ip = 
        req.headers['cf-connecting-ip'] ||  
        req.headers['x-real-ip'] ||
        req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress || '';

        console.log("Visitor IP:", ip);
        
        const userAgent = req.headers["user-agent"] || "Unknown";

        const referrer = req.headers["referer"] || req.headers["referrer"] || null;



        const deviceType = /mobile/i.test(userAgent)
            ? "Mobile"
            : /tablet/i.test(userAgent)
                ? "Tablet"
                : "Desktop";

        let country = req.headers["cf-ipcountry"];

        if (!country || country.length !== 2) {
              const geo = geoip.lookup(ip);
              country = geo?.country || "Unknown";
        }
        
        await ClickModel.recordClick(url.id, ip, country, deviceType, referrer);

        return res.redirect(url.original_url);

    } catch (error) {
        console.error("Redirection error:", error);

        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Redirection failed", [error]);
    }
};