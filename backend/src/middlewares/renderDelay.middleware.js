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


    return setTimeout(() => next(), 20000);
 
};
