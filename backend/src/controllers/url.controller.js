import { UrlModel } from "../models/url.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateShortCode } from "../utils/shortCodeGenerator.js";
import { fetchMetadata } from "../utils/fetchMeta.js";

const MAX_ALIAS_LENGTH = 10;
const ALIAS_PATTERN = /^[A-Za-z0-9_-]+$/;
const RESERVED_ALIASES = new Set(["api", "favicon.ico"]);

function assertValidDestination(originalUrl) {
  if (!originalUrl || typeof originalUrl !== "string" || !originalUrl.trim()) {
    throw new ApiError(400, "Original URL is required");
  }

  const trimmed = originalUrl.trim();

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new ApiError(400, "Original URL is not a valid URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new ApiError(400, "Original URL must use http or https");
  }

  return trimmed;
}

function assertValidAlias(customAlias) {
  const alias = String(customAlias).trim();

  if (alias.length > MAX_ALIAS_LENGTH) {
    throw new ApiError(
      400,
      `Custom back half must be ${MAX_ALIAS_LENGTH} characters or fewer`
    );
  }
  if (!ALIAS_PATTERN.test(alias)) {
    throw new ApiError(
      400,
      "Custom back half may only contain letters, numbers, hyphens and underscores"
    );
  }
  if (RESERVED_ALIASES.has(alias.toLowerCase())) {
    throw new ApiError(403, `"${alias}" is reserved and cannot be used`);
  }

  return alias;
}

async function generateUniqueShortCode(attempts = 5) {
  for (let i = 0; i < attempts; i++) {
    const candidate = generateShortCode(6);
    const existing = await UrlModel.getUrlByShortCode(candidate);
    if (!existing) return candidate;
  }
  throw new ApiError(500, "Could not generate a unique short code, try again");
}

async function resolveShortCode(customAlias) {
  if (!customAlias || !String(customAlias).trim()) {
    return { shortCode: await generateUniqueShortCode(), alias: null };
  }

  const alias = assertValidAlias(customAlias);

  const existingUrl = await UrlModel.getUrlByShortCode(alias);
  if (existingUrl) {
    throw new ApiError(
      409,
      `/${alias} is already taken. Please choose another one (leave blank for a random code).`
    );
  }

  return { shortCode: alias, alias };
}

export const createUrl = async (req, res) => {
  const userId = req.user.id;
  const { originalUrl, customAlias, expiresAt, title } = req.body;

  const destination = assertValidDestination(originalUrl);
  const { shortCode, alias } = await resolveShortCode(customAlias);

  const newUrl = await UrlModel.createUrl(
    userId,
    destination,
    shortCode,
    alias,
    expiresAt || null,
    title?.trim() || null
  );

  return res
    .status(201)
    .json(new ApiResponse(201, newUrl, "Short URL created successfully"));
};

export const createDemoUrl = async (req, res) => {
  const { originalUrl, expiresAt } = req.body;

  const destination = assertValidDestination(originalUrl);
  const shortCode = await generateUniqueShortCode();

  const newUrl = await UrlModel.createUrl(
    null,
    destination,
    shortCode,
    null,
    expiresAt || null,
    null
  );

  return res
    .status(201)
    .json(new ApiResponse(201, newUrl, "Short URL created successfully"));
};

export const getUserUrls = async (req, res) => {
  const urls = await UrlModel.getUrlsByUser(req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, urls, "User URLs fetched successfully"));
};

export const deleteUrl = async (req, res) => {
  const urlId = Number(req.params.id);
  if (!Number.isInteger(urlId) || urlId <= 0) {
    throw new ApiError(400, "Invalid URL id");
  }

  const url = await UrlModel.getUrlById(urlId);
  if (!url) throw new ApiError(404, "URL not found");

  if (url.user_id !== req.user.id) {
    throw new ApiError(403, "Forbidden: You can only delete your own URLs");
  }

  await UrlModel.deleteUrl(urlId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "URL deleted successfully"));
};

export const getMetafromUrl = async (req, res) => {
  const { url } = req.body;
  const destination = assertValidDestination(url);

  let preview;
  try {
    preview = await fetchMetadata(destination);
  } catch (error) {
    throw new ApiError(502, "Could not read metadata from that URL", [error]);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { title: preview?.title ?? null },
        "Metadata fetched successfully"
      )
    );
};
