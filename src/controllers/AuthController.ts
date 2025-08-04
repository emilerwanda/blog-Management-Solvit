import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { blacklistedTokens } from "../midlewares/authUserMiddleware";
import { destroyToken } from "../utils/helper";

export class AuthController {
  // Google OAuth login
  public static googleLogin(req: Request, res: Response, next: NextFunction) {
    return passport.authenticate('google', {
      scope: ['profile', 'email']
    })(req, res, next);
  }

  // Google OAuth callback
  // Google OAuth callback
  public static googleCallback(req: Request, res: Response, next: NextFunction) {
    interface AuthenticateCallbackInfo {
      message?: string;
    }
  
    interface AuthenticatedUser {
      id: string;
      email?: string;
      displayName?: string;
    }

    return passport.authenticate(
      'google',
      (
        err: Error | null,
        user: AuthenticatedUser | false,
        info: AuthenticateCallbackInfo | undefined
      ) => {
        if (err) {
          console.error('Google Auth Error:', err);
          return res.status(500).json({ error: err.message || 'Google Auth Error' });
        }
        if (!user) {
          return res.status(401).json({ error: info?.message || 'Authentication failed' });
        }
        req.logIn(user, (err: Error | null) => {
          if (err) {
            console.error('Login Error:', err);
            return res.status(500).json({ error: 'Login failed' });
          }

          // Instead of redirecting, pass to the next middleware
          return next();
        });
      }
    )(req, res, next);
  }

  // Logout
  public static logout(req: Request, res: Response) {
    // Add the session ID to the blacklist
    if (req.sessionID) {
      blacklistedTokens.add(req.sessionID);
    }
    
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    // If token exists, blacklist it in the database
    if (token) {
      destroyToken(token).catch(err => {
        console.error('Error blacklisting token:', err);
      });
    }
    
    // Logout using Passport
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error during logout'
        });
      }
      
      // Destroy the session
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Error destroying session'
          });
        }
        
        res.status(200).json({
          success: true,
          message: 'Logged out successfully'
        });
      });
    });
  }
}