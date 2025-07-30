import { Router, Request, Response, NextFunction } from "express";
import { Like } from "../database/models/Likes";
import { Blog } from "../database/models/Blog";
import { User } from "../database/models/User";
import { isAuthenticated } from "../midlewares/authUserMiddleware";

const likeRouter = Router();

likeRouter.post('/likes', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { blogId } = req.body;
        const user = (req as any).user?.id; 

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        if (!blogId) {
            return res.status(400).json({
                success: false,
                message: 'Blog ID is required'
            });
        }

     
        const blog = await Blog.findByPk(blogId);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

       
        const existingLike = await Like.findOne({
            where: { user, blogId }
        });

        if (existingLike) {
            return res.status(409).json({
                success: false,
                message: 'You have already liked this blog'
            });
        }

      
        const like = await Like.create({
            user,
            blogId
        });

        return res.status(201).json({
            success: true,
            message: 'Blog liked successfully',
            data: like
        });
    } catch (error) {
        console.error('Error creating like:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


likeRouter.get('/likes/blog/:blogId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { blogId } = req.params;

        const likes = await Like.findAll({
            where: { blogId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            message: 'Likes retrieved successfully',
            data: likes
        });
    } catch (error) {
        console.error('Error retrieving likes:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


likeRouter.get('/likes/count/:blogId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { blogId } = req.params;

        const count = await Like.count({
            where: { blogId }
        });

        return res.status(200).json({
            success: true,
            message: 'Like count retrieved successfully',
            data: { count }
        });
    } catch (error) {
        console.error('Error retrieving like count:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


likeRouter.get('/likes/check/:blogId', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { blogId } = req.params;
        const user = (req as any).user?.id;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const like = await Like.findOne({
            where: { user, blogId }
        });

        return res.status(200).json({
            success: true,
            message: 'Like status retrieved successfully',
            data: { liked: !!like }
        });
    } catch (error) {
        console.error('Error checking like status:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


likeRouter.get('/likes/user/:userId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;

        const likes = await Like.findAll({
            where: { user: userId },
            include: [
                {
                    model: User,
                    as: 'user',
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
            message: 'User likes retrieved successfully',
            data: likes
        });
    } catch (error) {
        console.error('Error retrieving user likes:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


likeRouter.delete('/likes/:id', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const currentUser = (req as any).user?.id;

        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const like = await Like.findByPk(id);
        if (!like) {
            return res.status(404).json({
                success: false,
                message: 'Like not found'
            });
        }

       
        if (like.user !== currentUser) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own likes'
            });
        }

   
        await like.destroy();

        return res.status(200).json({
            success: true,
            message: 'Like removed successfully'
        });
    } catch (error) {
        console.error('Error deleting like:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


likeRouter.delete('/likes/blog/:blogId', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { blogId } = req.params;
        const currentUser = (req as any).user?.id;

        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const like = await Like.findOne({
            where: { user: currentUser, blogId }
        });

        if (!like) {
            return res.status(404).json({
                success: false,
                message: 'Like not found'
            });
        }

       
        await like.destroy();

        return res.status(200).json({
            success: true,
            message: 'Blog unliked successfully'
        });
    } catch (error) {
        console.error('Error unliking blog:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

export { likeRouter }; 