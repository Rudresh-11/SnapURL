import dotenv from 'dotenv';
dotenv.config();
import * as logger from './src/utils/logger.js';
import app from './app.js'
import connectDB from './src/config/db.js';
import connectRedis from './src/config/redis.js';
import { renderDelay } from './src/middlewares/renderDelay.middleware.js';

const PORT = process.env.PORT || 3000;


(async () => {
  try {
    await connectDB();
    await connectRedis();
    app.use(renderDelay);
    app.listen(PORT, () => console.log(`SnapURL server running on port ${PORT}`));
  } catch (err) {
    console.error("Startup error:", err.message);
    process.exit(1);
  }
})();