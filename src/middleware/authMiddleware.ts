import { Request, Response, NextFunction } from "express";
import { ResponseService } from "../utils/response";
import jwt from "jsonwebtoken";
import { secretkey } from "../utils/helper";

type userPayload = {
  _id: string;
  email: string;
  role?: string;
};

interface jwtPayloadExtra extends jwt.JwtPayload {
  _id: string;
  email: string;
  role?: string;
}

export interface AuthRequest extends Request {
  user?: userPayload;
}

export const AuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      return ResponseService({
        res,
        message: "Unauthorized Access",
        status: 401,
        success: false,
      });
    }

    const token = authorization.split(" ")[1];
    const isValid = jwt.verify(token, secretkey) as jwtPayloadExtra;

    const user: userPayload = {
      _id: isValid._id,
      email: isValid.email,
      role: isValid.role,
    };

    req.user = user;
    next();
  } catch (error) {
    const { stack } = error as Error;
    return ResponseService({
      res,
      data: stack,
      message: "Please login again",
      status: 401,
      success: false,
    });
  }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") {
    return ResponseService({
      res,
      message: "Admins only post a blog.",
      status: 403,
      success: false,
    });
  }
  next();
};

export const checkRole = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const user = req.user;

            if (!user || !user.role || !allowedRoles.includes(user.role)) {
                return ResponseService({
                    data: null,
                    status: 403,
                    success: false,
                    message: "You do not have permission to perform this action",
                    res
                });
            }
            
            next();
        } catch (error) {
            const { message, stack } = error as Error;
            ResponseService({
                data: { message, stack },
                status: 500,
                success: false,
                res
            });
        }
    };
};