import { Router } from "express";
import passport from "passport"; 
import { blacklistedTokens } from "../midlewares/authUserMiddleware"
import { Request, Response, NextFunction } from "express";

const authRouters = Router();

authRouters.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

authRouters.get('/auth/google/callback',
  (req, res, next) => {

    interface AuthenticateCallbackInfo {
      message?: string;
    }
  
    interface AuthenticatedUser {
      id: string;
      email?: string;
      displayName?: string;

    }

    passport.authenticate(
      'google',
      (
        err: Error | null,
        user: AuthenticatedUser | false,
        info: AuthenticateCallbackInfo | undefined
      ) => {
        if (err) {
          console.error('Google Auth Error:', err);
          return (res as Response).status(500).json({ error: err.message || 'Google Auth Error' });
        }
        if (!user) {
          return (res as Response).status(401).json({ error: info?.message || 'Authentication failed' });
        }
        (req as Request).logIn(user, (err: Error | null) => {
          if (err) {
            console.error('Login Error:', err);
            return (res as Response).status(500).json({ error: 'Login failed' });
          }

          return (res as Response).redirect('/dashboard');
        });
      }
    )(req as Request, res as Response, next as NextFunction);
  }
);


authRouters.get('/logout', (req: any, res) => {

    const sessionIdToBlacklist = req.sessionID;
    if (sessionIdToBlacklist) {
      blacklistedTokens.add(sessionIdToBlacklist);
    }
    req.logout();
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).send('Error logging out');
      }

      res.send(`you log out successfuly, ${req.user ? (req.user as any).name : 'user'}!`);
      res.redirect('/');
    });
});

export { authRouters };