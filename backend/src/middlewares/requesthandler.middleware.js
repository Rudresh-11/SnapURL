export function requestLogger(req, res, next) {
  const start = Date.now();

  console.log(`\n${req.method} ${req.originalUrl}\n`);

  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`\n${req.method} ${req.originalUrl}  ${res.statusCode} - ${ms}ms`);
  });

  next();
}