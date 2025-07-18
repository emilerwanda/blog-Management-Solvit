import mongoose from "mongoose"

export interface BlogInterface{
    _id: string
    slug:string
    title: string
    author: string
    content:string
    isPublished: boolean
    description: string
    createdAt: string
    updatedAt: string
    deletedAt: null|string |undefined
    likes: number;
    likedBy: mongoose.Types.ObjectId[];

}
export interface interfaceAddBlog extends Omit<BlogInterface,'id'>{}
export interface GetAllBlogs{
    blogs:BlogInterface[]
}