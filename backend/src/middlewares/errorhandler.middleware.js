import { ApiError } from "../utils/ApiError.js";

export function errorHandler(err, req, res, next) {
  console.error("GLOBAL ERROR:", err);

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
