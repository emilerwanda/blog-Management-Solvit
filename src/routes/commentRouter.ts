import { Router } from "express";
import { CommentController } from "../controllers/CommentController";
import { isAuthenticated } from "../midlewares/authUserMiddleware";

const commentRouter = Router();

commentRouter.post('/comments', isAuthenticated, CommentController.createComment);
commentRouter.get('/comments/blog/:blogId', CommentController.getCommentsByBlogId);
commentRouter.get('/comments/:id', CommentController.getCommentById);

// Add other comment routes here

export { commentRouter };