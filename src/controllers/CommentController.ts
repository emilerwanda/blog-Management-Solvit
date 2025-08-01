import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { ResponseService } from "../utils/response";
import { CommentModel } from "../models/commentsModel";
import { blogModel } from "../models/blogModel";


export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { blogId } = req.params;
    const { text } = req.body;
    const user = req.user;

    const blog = await blogModel.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const comment = new CommentModel({
      content: text,           
      user: user?._id,         
      blog: blogId,             
      created: new Date(),
    });

    await comment.save();

    ResponseService({
      res,
      message: "Commented successfully",
      success: true,
      status: 201,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to post comment", error });
  }
};


export const getCommentsByBlog = async (req: AuthRequest, res: Response) => {
  try {
    const { blogId } = req.params;

    const comments = await CommentModel.find({ blog: blogId })
      .populate("user", "-password")  
      .sort({ created: -1 });         

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch comments", error });
  }
};
