import express, { Request, Response } from "express";
import { Router } from "express";
import { BasicController } from "../controllers/BasicController";
import { isAuthenticated } from "../midlewares/authUserMiddleware";

const BasicRouters = Router();

BasicRouters.get('/', BasicController.welcome);
BasicRouters.get('/dashboard', isAuthenticated, BasicController.dashboard);

export { BasicRouters };