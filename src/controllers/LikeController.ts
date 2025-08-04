import { Request, Response, NextFunction } from "express";
import { Like } from "../database/models/Likes";
import { Blog } from "../database/models/Blog";
import { User } from "../database/models/User";

export class LikeController {
  // Create like
  public static async createLike(req: Request, res: Response, next: NextFunction) {
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
  }

  // Get likes by blog ID
  public static async getLikesByBlogId(req: Request, res: Response, next: NextFunction) {
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
  }

  // Add other like-related methods here
}