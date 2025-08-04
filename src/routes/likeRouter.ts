import { Router } from "express";
import { LikeController } from "../controllers/LikeController";
import { isAuthenticated } from "../midlewares/authUserMiddleware";

const likeRouter = Router();

likeRouter.post('/likes', isAuthenticated, LikeController.createLike);
likeRouter.get('/blogs/:blogId/likes', LikeController.getLikesByBlogId);


// Add other like routes here

export { likeRouter };