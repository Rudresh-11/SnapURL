import { getClicksByUrl, getAnalyticsOverview, getClicksByDate, getHomeStats } from "../controllers/analytics.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import express from "express";

const router = express.Router();

router.get("/:id/allclicks", verifyJWT, getClicksByUrl);
router.get("/:id/overview", verifyJWT, getAnalyticsOverview);
router.get("/:id/clicksbydate", verifyJWT, getClicksByDate);
router.get("/stats", getHomeStats)

export default router;