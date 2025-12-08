import { ApiError } from "../utils/ApiError.js";

function formatStack(err) {
  if (!err.stack) return err;

  const cwd = process.cwd().replace(/\\/g, "/");

  // split stack lines
  const lines = err.stack.split("\n");

  // Only keep lines FROM YOUR PROJECT
  const filtered = lines.filter(line => {
    const normalized = line.replace(/\\/g, "/");

    // keep if inside cwd and NOT inside node_modules
    return normalized.includes(cwd) && !normalized.includes("node_modules");
  });

  // No filtered stack? fallback to entire error message only
  if (filtered.length === 0) {
    return `${err.name}: ${err.message}`;
  }

  return [
    `${err.name}: ${err.message}`,
    ...filtered
  ].join("\n");
}


export function errorHandler(err, req, res, next) {
  console.error("GLOBAL ERROR:", err.message);

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
