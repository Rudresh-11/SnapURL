let lastRequest = Date.now();
let cold = true;

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const renderDelay = (req, res, next) => {
    
  if (process.env.RENDER_DELAY !== "true") {
    return next();
  }
  console.log("Render delay middleware active");
  const now = Date.now();

  // If no request for RENDER_COLD_TIMEOUT => cold start again
  if (now - lastRequest > Number(process.env.RENDER_COLD_TIMEOUT || 20000)) {
    cold = true;
  }

  lastRequest = now;

  if (cold) {
    const delay = random(
      Number(process.env.RENDER_COLD_DELAY_MIN || 4000),
      Number(process.env.RENDER_COLD_DELAY_MAX || 9000)
    );

    console.log(`❄️ Cold start delay: ${delay}ms`);
    cold = false;

    return setTimeout(() => next(), delay);
  }

  // Warm delay always applied
  const warmDelay = random(
    Number(process.env.RENDER_WARM_DELAY_MIN || 200),
    Number(process.env.RENDER_WARM_DELAY_MAX || 1700)
  );

  console.log(`⏳ Warm delay: ${warmDelay}ms`);

  return setTimeout(() => next(), warmDelay);
};
