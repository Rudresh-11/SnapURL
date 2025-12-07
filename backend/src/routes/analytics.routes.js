import { getClicksByUrl , getAnalyticsOverview, getClicksByDate } from "../controllers/analytics.controller.js";
import express from "express";

const router = express.Router();

router.get("/:id/allclicks", getClicksByUrl);
router.get("/:id/overview", getAnalyticsOverview);
router.get("/:id/clicksbydate", getClicksByDate);

export default router;