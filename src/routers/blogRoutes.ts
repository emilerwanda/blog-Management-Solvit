import { Router } from "express";
import { getAllBlogs, createBlog, getABlog, likeBlog } from '../controllers/blogController'
import { ValidationMiddleware } from "../middleware/validationMiddleware";
import { AddBlogSchema, IdValidationSchema } from '../schemas/blogSchema'
import { AuthMiddleware, isAdmin } from "../middleware/authMiddleware";
import { createComment, getCommentsByBlog } from '../controllers/CommentController';
import { commentSValidatechema } from "../schemas/commentSchema";
import { storage } from "../utils/upload"
import multer from "multer";

const uploadMiddleware = multer({storage})

const blogRouter = Router();
blogRouter.get('/blogs', getAllBlogs)


blogRouter.post('/blogs', uploadMiddleware.single('blog_image_url'), AuthMiddleware, ValidationMiddleware({ 
    type: 'body', schema: AddBlogSchema 
}), createBlog)

blogRouter.get('/blogs/:id', ValidationMiddleware({
    type: 'params', schema: IdValidationSchema,
}), getABlog);

blogRouter.post('/blogs/comments/:blogId', ValidationMiddleware({
    type: 'body',
    schema: commentSValidatechema
}),createComment);

blogRouter.get('/blogs/comments/:blogId', getCommentsByBlog); 

blogRouter.post('/blogs/like/:id', AuthMiddleware, likeBlog);     

export { blogRouter }