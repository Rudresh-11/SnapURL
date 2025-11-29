import express from "express";
import { redirectUrl } from "../controllers/click.controller.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(400).send("Shortcode required");
});

router.get("/:shortCode", redirectUrl);

export default router;