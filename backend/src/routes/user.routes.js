import { loginUser , registerUser ,logoutUser,getCurrentUser, loginUserWithGoogle } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();    
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/login/google", loginUserWithGoogle);
router.post("/logout",verifyJWT, logoutUser);
router.get("/me",verifyJWT, getCurrentUser);

export default router;