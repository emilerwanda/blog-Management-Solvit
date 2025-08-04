import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { generateOAuthToken, handleOAuthCallback } from "../midlewares/authUserMiddleware";

const authRouters = Router();

authRouters.get('/auth/google', AuthController.googleLogin);
authRouters.get('/auth/google/callback', AuthController.googleCallback, generateOAuthToken, handleOAuthCallback);
authRouters.get('/logout', AuthController.logout);

export { authRouters };