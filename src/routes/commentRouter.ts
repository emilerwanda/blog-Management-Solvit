import { Router, Request, Response, NextFunction } from "express";
import { Comment } from "../database/models/Comments";
import { Blog } from "../database/models/Blog";
import { User } from "../database/models/User";
import { isAuthenticated } from "../midlewares/authUserMiddleware";
import { AddCommentSchema } from "../schemas/commentSchema";

const commentRouter = Router();

commentRouter.post('/comments', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = AddCommentSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { content, blogId } = value;
        const author = (req as any).user?.id; 

        if (!author) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

     
        const blog = await Blog.findByPk(blogId);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

     
        const comment = await Comment.create({
            content,
            blogId,
            author
        });

        return res.status(201).json({
            success: true,
            message: 'Comment created successfully',
            data: comment
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


commentRouter.get('/comments/blog/:blogId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { blogId } = req.params;

        const comments = await Comment.findAll({
            where: { blogId },
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['createdAt', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            message: 'Comments retrieved successfully',
            data: comments
        });
    } catch (error) {
        console.error('Error retrieving comments:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


commentRouter.get('/comments/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const comment = await Comment.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Comment retrieved successfully',
            data: comment
        });
    } catch (error) {
        console.error('Error retrieving comment:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


commentRouter.put('/comments/:id', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }

        const comment = await Comment.findByPk(id);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        
        const currentUser = (req as any).user;
        if (comment.author !== currentUser.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own comments'
            });
        }

    
        await comment.update({ content });

        return res.status(200).json({
            success: true,
            message: 'Comment updated successfully',
            data: comment
        });
    } catch (error) {
        console.error('Error updating comment:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

commentRouter.delete('/comments/:id', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const comment = await Comment.findByPk(id);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

      
        const currentUser = (req as any).user;
        if (comment.author !== currentUser.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own comments'
            });
        }

       
        await comment.destroy();

        return res.status(200).json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


commentRouter.get('/comments/user/:userId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;

        const comments = await Comment.findAll({
            where: { author: userId },
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Blog,
                    as: 'blog',
                    attributes: ['id', 'title', 'slug']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            message: 'User comments retrieved successfully',
            data: comments
        });
    } catch (error) {
        console.error('Error retrieving user comments:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

export { commentRouter }; 