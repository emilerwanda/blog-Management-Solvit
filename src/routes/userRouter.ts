import { Router } from "express";
import { UserController } from "../controllers/UserController";

const userRouter = Router();

userRouter.post('/users', UserController.createUser);
userRouter.post('/login', UserController.loginUser);

// Add other user routes here

export { userRouter };