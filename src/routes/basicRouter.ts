import express, { Request, Response } from "express";
import { Router } from "express";
import { isAuthenticated } from "../midlewares/authUserMiddleware";

const BasicRouters = Router();

BasicRouters.get('/', (req: Request, res: Response) => {
  res.send('Welcome, First login with google');
});

BasicRouters.get('/dashboard', isAuthenticated, (req, res) => {
  res.json({
    sucess: true,
    user: req.user
  })
  res.send(`Welcome to the dashboard, ${req.user ? (req.user as any).name : 'user'}!`);
});

BasicRouters.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});


export { BasicRouters }