import { ApiError } from "../utils/ApiError.js";

export function errorHandler(err, req, res, next) {
  if (process.env.NODE_ENV !== "test") {
    console.error("GLOBAL ERROR:", err.message || err);
    console.error(
      err instanceof ApiError ? "Cause:" : "Cause (unhandled):",
      err instanceof ApiError ? err.errors : err.stack || err
    );
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
