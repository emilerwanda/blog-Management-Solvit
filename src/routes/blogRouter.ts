import { Router, Request, Response, NextFunction } from "express";
import { Blog } from "../database/models/Blog";
import { User } from "../database/models/User";
import { isAuthenticated } from "../midlewares/authUserMiddleware";
import { AddBlogSchema, UpdateBlogSchema } from "../schemas/blogShema";

const blogRouter = Router();

blogRouter.post('/blogs', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = AddBlogSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { title, description, content, blog_image_url, isPublished } = value;
        const author = (req as any).user?.id; // Get user ID from authenticated request

        if (!author) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        
        // Create blog
        const blog = await Blog.create({
            title,
            description,
            content,
            blog_image_url,
            isPublished: isPublished || false,
            author
        });

        return res.status(201).json({
            success: true,
            message: 'Blog created successfully',
            data: blog
        });
    } catch (error) {
        console.error('Error creating blog:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

blogRouter.get('/blogs', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const blogs = await Blog.findAndCountAll({
            where: { isPublished: true },
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name', 'email']
                }
            ],
            limit: Number(limit),
            offset,
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            message: 'Blogs retrieved successfully',
            data: {
                blogs: blogs.rows,
                total: blogs.count,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(blogs.count / Number(limit))
            }
        });
    } catch (error) {
        console.error('Error retrieving blogs:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


blogRouter.get('/blogs/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const blog = await Blog.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Blog retrieved successfully',
            data: blog
        });
    } catch (error) {
        console.error('Error retrieving blog:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


blogRouter.put('/blogs/:id', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { error, value } = UpdateBlogSchema.validate(req.body);
        
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const blog = await Blog.findByPk(id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        const currentUser = (req as any).user;
        if (blog.author !== currentUser.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own blogs'
            });
        }

     
        await blog.update(value);

        return res.status(200).json({
            success: true,
            message: 'Blog updated successfully',
            data: blog
        });
    } catch (error) {
        console.error('Error updating blog:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


blogRouter.delete('/blogs/:id', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const blog = await Blog.findByPk(id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        
        const currentUser = (req as any).user;
        if (blog.author !== currentUser.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own blogs'
            });
        }

       
        await blog.destroy();

        return res.status(200).json({
            success: true,
            message: 'Blog deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting blog:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


blogRouter.get('/blogs/user/:userId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;

        const blogs = await Blog.findAll({
            where: { 
                author: userId,
                isPublished: true 
            },
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            message: 'User blogs retrieved successfully',
            data: blogs
        });
    } catch (error) {
        console.error('Error retrieving user blogs:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

export { blogRouter }; 