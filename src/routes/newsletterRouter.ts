import { Router } from "express";
import { SubscriberController } from "../controllers/SubscriberController";
import { isAuthenticated } from "../midlewares/authUserMiddleware";

const newsletterRouter = Router();

// Public routes
newsletterRouter.post('/newsletter/subscribe', SubscriberController.subscribe);
newsletterRouter.get('/newsletter/unsubscribe', SubscriberController.unsubscribe);
newsletterRouter.post('/newsletter/unsubscribe', SubscriberController.unsubscribe);

// Admin routes
newsletterRouter.get('/newsletter/subscribers', isAuthenticated, SubscriberController.getAllSubscribers);

export { newsletterRouter };