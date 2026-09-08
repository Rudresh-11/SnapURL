const COLD_START_DELAY_MS = Number(process.env.RENDER_DELAY_MS) || 20000;

let cold = true;

export const renderDelay = (req, res, next) => {
  if (process.env.RENDER_DELAY !== "true") return next();
  if (!cold) return next();

  cold = false;
  console.log(`Render delay: holding first request for ${COLD_START_DELAY_MS}ms`);

  const timer = setTimeout(next, COLD_START_DELAY_MS);
  timer.unref?.();
  res.on?.("close", () => clearTimeout(timer));
};
