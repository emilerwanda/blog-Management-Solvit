import { ResponseService } from "../utils/response";
import { BlogInterface, GetAllBlogs, interfaceAddBlog } from '../types/blogInterface'
import { blogModel } from "../models/blogModel";
import { Request, Response } from 'express'
import { generateSlug } from "../utils/helper";
import { ObjectId } from "mongodb";
import { AuthRequest } from "../middleware/authMiddleware";
import { UserModel } from "../models/userModel";


const getAllBlogs = async (req: Request, res: Response) => {
    try {
        const blogs = await blogModel.find().populate('author');

        ResponseService({
            data: blogs,
            status: 200,
            success: true,
            res
        })
    } catch (err) {
        const { message, stack } = err as Error
        res.status(500).json({ message, stack })
    }
}
interface IRequestBlog extends AuthRequest {
    body: interfaceAddBlog
}


const createBlog = async (req: IRequestBlog, res: Response) => {
    try {
        const _id = req?.user?._id as string
        const author = await UserModel.findOne({
            _id
        })
        const { title, description, content, isPublished } = req.body
        const blog = new blogModel({
            title,
            description,
            content,
            slug: generateSlug(title),
            author,
            isPublished,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        await blog.save();
        ResponseService({
            data: blog,
            success: true,
            message: "Saved well",
            status: 201,
            res
        })

    } catch (error) {
        console.log(error)
    }
}
interface GetBlogByIdRequestInterface extends Request {
    params: {
        id: string
    }
}


const getABlog = async (req: GetBlogByIdRequestInterface, res: Response) => {
    try {
        const { id } = req.params
        const blog = await blogModel.findOne({
            _id: new ObjectId(id),
        })
        if (!blog) {
            ResponseService({
                status: 404,
                success: false,
                message: "Blog not Found",
                res
            })
        }
        ResponseService({
            data: blog,
            res,
            message: "Blog Fetch successfuly"
        })
    } catch (error) {
        const { message, stack } = (error as Error)
        ResponseService({
            res,
            data: stack,
            message,
            status: 500,
            success: false
        })
    }
}

// const likeBlog = async (req: AuthRequest, res: Response) => {
//     try {
//         const blogId = req.params.id
//         const userId = req.user?._id as string

//         const blog = await blogModel.findById(blogId);
//         if (!blog) {
//             return ResponseService({
//                 res,
//                 status: 404,
//                 success: false,
//                 message: "Blog not found"
//             });
//         }

//         const alreadyLiked = blog.likedBy.includes(userId);

//         if (alreadyLiked) {
//             return ResponseService({
//                 res,
//                 status: 400,
//                 success: false,
//                 message: "You already liked this blog"
//             });
//         }

//         blog.likes +1;
//         if (userId) {
//             blog.likedBy.push(userId);
//         }
//         await blog.save();

//         ResponseService({
//             res,
//             status: 200,
//             success: true,
//             message: "Blog liked successfully",
//             data: {
//                 likes: blog.likes
//             }
//         });

//     } catch (error) {
//         const { message, stack } = error as Error;
//         ResponseService({
//             res,
//             data: stack,
//             message,
//             status: 500,
//             success: false
//         });
//     }
// }


export { getAllBlogs, createBlog, getABlog, /*likeBlog*/ }