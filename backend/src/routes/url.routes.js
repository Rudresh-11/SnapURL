import {createUrl, getUserUrls, deleteUrl} from "../controllers/url.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import {Router} from "express";


const router = Router();

router.post("/shorten", verifyJWT, createUrl);
router.get("/get", verifyJWT, getUserUrls);
router.delete("/:id", verifyJWT, deleteUrl);

export default router;