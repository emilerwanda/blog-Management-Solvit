import mongoose, {model,Schema} from "mongoose"

interface BlogSchemaInterface{
    slug: string
    title: string
    author: { type: typeof mongoose.Types.ObjectId; ref: string; }
    content: string
    isPublished: boolean
    description: string
    createdAt: NativeDate
    updatedAt: NativeDate
    deletedAt: null | string | undefined
    likes: {  type: Number,    default: 0,},
    likedBy: [{   type: typeof mongoose.Schema.Types.ObjectId, ref: string}]

}
const blogModelSchema = new Schema<BlogSchemaInterface> ({
    title: String,
    slug: String,
    description: String,
    content: String,
    author: {
        type:mongoose.Types.ObjectId,
        ref: 'Users'
    },
    isPublished: Boolean,
    createdAt: Date,
    updatedAt: {
        type: Date,
        default: new Date(),
        unique:true
    },
    deletedAt:Date,
    likes: {
        type: Number,
        default: 0
    }
})
export const blogModel =  model<BlogSchemaInterface>("blogs", blogModelSchema)