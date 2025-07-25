import helmet from 'helmet';
import cors from 'cors';
import express from 'express';

export function applySecurityMiddleware(app: express.Application) {
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
}