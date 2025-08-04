import { Request, Response, NextFunction } from "express";
import { Comment } from "../database/models/Comments";
import { Blog } from "../database/models/Blog";
import { User } from "../database/models/User";
import { AddCommentSchema } from "../schemas/commentSchema";

export class CommentController {
  // Create comment
  public static async createComment(req: Request, res: Response, next: NextFunction) {
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
  }

  // Get comments by blog ID
  public static async getCommentsByBlogId(req: Request, res: Response, next: NextFunction) {
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
  }

  // Get comment by ID
  public static async getCommentById(req: Request, res: Response, next: NextFunction) {
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
  }

  // Add other comment-related methods here
}