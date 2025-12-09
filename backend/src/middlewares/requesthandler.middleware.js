export function requestLogger(req, res, next) {
  const start = Date.now();

  // Keep reference to original res.json
  const originalJson = res.json;

  res.json = function (body) {
    // attach response body so logger can read it
    res.locals.body = body;
    return originalJson.call(this, body);
  };

  console.log(`\n\n${req.method} ${req.originalUrl}`);

  res.on("finish", () => {
    const ms = Date.now() - start;

    const message = res.locals.body?.message ?? "-";
    const success = res.locals.body?.success;

    console.log(
      `Response ${req.method} ${req.originalUrl} | ${res.statusCode} | ${success ? "SUCCESS" : "FAIL"} | ${message} | ${ms}ms`
    );
  });

  next();
}
