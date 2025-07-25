import express from 'express';

const blacklistedTokens: Set<string> = new Set();

function isAuthenticated(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.isAuthenticated()) {
    const sessionId = req.sessionID;
    if (sessionId && blacklistedTokens.has(sessionId)) {
      return res.status(401).send('Session is blacklisted');
    }
    return next();
  }
  res.redirect('/auth/google');
}

export { isAuthenticated, blacklistedTokens };