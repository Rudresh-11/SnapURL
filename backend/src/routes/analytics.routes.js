import { getClicksByUrl , getCountsByUrl,getCountryStats,getReferrerStats,getDeviceStats } from "../controllers/analytics.controller.js";
import express from "express";

const router = express.Router();

router.get("/:id/clicks", getClicksByUrl);
router.get("/:id/counts", getCountsByUrl);
router.get("/:id/country-stats", getCountryStats);
router.get("/:id/device-stats", getDeviceStats);
router.get("/:id/referrer-stats", getReferrerStats);

export default router;