import { getClicksByUrl , getAnalyticsOverview } from "../controllers/analytics.controller.js";
import express from "express";

const router = express.Router();

router.get("/:id/clicks", getClicksByUrl);
router.get("/:id/overview", getAnalyticsOverview);

export default router;