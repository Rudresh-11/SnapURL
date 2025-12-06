import {createUrl, getUserUrls, deleteUrl, getMetafromUrl} from "../controllers/url.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import {Router} from "express";


const router = Router();

router.post("/shorten", verifyJWT, createUrl);
router.get("/get", verifyJWT, getUserUrls);
router.delete("/delete/:id", verifyJWT, deleteUrl);
router.post("/metadata", getMetafromUrl);// not working

export default router;