import { Router } from "express";
import { BlogController } from "../controllers/BlogController";
import { isAuthenticated } from "../midlewares/authUserMiddleware";

const blogRouter = Router();

blogRouter.post('/blogs', isAuthenticated, BlogController.createBlog);
blogRouter.get('/blogs', BlogController.getAllBlogs);
blogRouter.get('/blogs/:id', BlogController.getBlogById);

// Add other blog routes here

export { blogRouter };