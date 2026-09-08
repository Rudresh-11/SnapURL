import { UrlModel } from "../models/url.model.js";
import { ClickModel } from "../models/click.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import countries from "i18n-iso-countries";
import geoip from "geoip-lite";

function isExpired(url) {
  if (!url.expires_at) return false;
  const expiry = new Date(url.expires_at);
  return !Number.isNaN(expiry.getTime()) && expiry.getTime() <= Date.now();
}

function resolveClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];

  return (
    req.headers["cf-connecting-ip"] ||
    req.headers["x-real-ip"] ||
    (typeof forwarded === "string" ? forwarded.split(",")[0].trim() : "") ||
    req.socket.remoteAddress ||
    ""
  );
}

function resolveDeviceType(userAgent) {
  if (/tablet|ipad/i.test(userAgent)) return "Tablet";
  if (/mobile|android|iphone/i.test(userAgent)) return "Mobile";
  return "Desktop";
}

function resolveCountry(req, ip) {
  const headerCountry = req.headers["cf-ipcountry"];

  const code =
    typeof headerCountry === "string" && headerCountry.length === 2
      ? headerCountry
      : geoip.lookup(ip)?.country;

  if (!code) return "Unknown";
  return countries.getName(code, "en") || "Unknown";
}

export const redirectUrl = async (req, res) => {
  const shortCode = req.params.shortCode;
  if (!shortCode) throw new ApiError(400, "Shortcode is required");

  const url = await UrlModel.getUrlByShortCode(shortCode);

  if (req.query.check === "true") {
    if (!url || isExpired(url)) throw new ApiError(404, "Url not found");
    return res
      .status(200)
      .json(new ApiResponse(200, { exist: true }, "Url exist"));
  }

  if (!url) throw new ApiError(404, "URL not found");

  if (isExpired(url)) throw new ApiError(410, "This link has expired");

  const ip = resolveClientIp(req);
  const userAgent = req.headers["user-agent"] || "Unknown";
  const referrer = req.query?.ref || "Direct";

  try {
    await UrlModel.incrementClick(shortCode);
    await ClickModel.recordClick(
      url.id,
      ip,
      resolveCountry(req, ip),
      resolveDeviceType(userAgent),
      String(referrer).slice(0, 100)
    );
  } catch (error) {
    console.error("Failed to record click for", shortCode, error.message);
  }

  return res.redirect(url.original_url);
};
