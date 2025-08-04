import { Request, Response } from "express";

export class BasicController {
  // Welcome page
  public static welcome(req: Request, res: Response) {
    res.send('Welcome, First login with google');
  }

  // Dashboard
  public static dashboard(req: Request, res: Response) {
    res.json({
      sucess: true,
      user: req.user
    });
  }
}