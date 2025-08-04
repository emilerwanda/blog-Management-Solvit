import { Request, Response, NextFunction } from "express";
import { Blog } from "../database/models/Blog";
import { User } from "../database/models/User";
import { AddBlogSchema, UpdateBlogSchema } from "../schemas/blogShema";
import { Subscriber } from "../database/models/Subscriber";
import { sendNewBlogNotification } from "../utils/emailService";

export class BlogController {
  // Create blog
  public static async createBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = AddBlogSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const { title, description, content, blog_image_url, isPublished } = value;
      const author = (req as any).user?.id;

      if (!author) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }
      
      const blog = await Blog.create({
        title,
        description,
        content,
        blog_image_url,
        isPublished: isPublished || false,
        author
      });

      // If blog is published, send notifications to subscribers
      if (blog.isPublished) {
        // Get author details
        const authorDetails = await User.findByPk(author);
        if (!authorDetails) {
          console.error('Author not found for notification');
        } else {
          // Send notifications in the background
          BlogController.sendNotificationsToSubscribers(blog, authorDetails).catch(err => {
            console.error('Error sending notifications:', err);
          });
        }
      }

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
  }

  // Helper method to send notifications to all subscribers
  private static async sendNotificationsToSubscribers(blog: Blog, author: User) {
    try {
      // Get all active subscribers
      const subscribers = await Subscriber.findAll({ where: { isActive: true } });
      
      // Send notification to each subscriber
      const notificationPromises = subscribers.map(subscriber => 
        sendNewBlogNotification(blog, author, subscriber.email)
      );
      
      // Wait for all notifications to be sent
      await Promise.all(notificationPromises);
      
      console.log(`Notifications sent to ${subscribers.length} subscribers for blog: ${blog.id}`);
    } catch (error) {
      console.error('Error sending notifications to subscribers:', error);
      throw error;
    }
  }

  // Get all blogs
  public static async getAllBlogs(req: Request, res: Response, next: NextFunction) {
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
  }

  // Get blog by ID
  public static async getBlogById(req: Request, res: Response, next: NextFunction) {
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
  }

  // Add other blog-related methods here
}