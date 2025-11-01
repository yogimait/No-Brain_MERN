import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    addAPIKey,
    getAPIKey,
    getCurrentUser
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// Protected routes
router.route("/logout").post(authMiddleware, logoutUser);
router.route("/me").get(authMiddleware, getCurrentUser);
router.route("/keys/add").post(authMiddleware, addAPIKey);
router.route("/keys/get/:service").get(authMiddleware, getAPIKey);

export default router;