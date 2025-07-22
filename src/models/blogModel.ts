import mongoose, { Schema, model } from "mongoose";

interface BlogSchemaInterface {
  slug: string;
  title: string;
  author: mongoose.Types.ObjectId;
  content: string;
  isPublished: boolean;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null | undefined;
  likes: number;
  likedBy: mongoose.Types.ObjectId[];
  blog_image_url:String,
}

const blogSchema = new Schema<BlogSchemaInterface>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  content: { type: String, required: true },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  deletedAt: { type: Date, default: null },
  likes: { type: Number, default: 0 },
  likedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  ],
  blog_image_url:String,
});


blogSchema.virtual("comments", {
  ref: "Comment",       
  localField: "_id",      
  foreignField: "blog",   
});


blogSchema.set("toObject", { virtuals: true });
blogSchema.set("toJSON", { virtuals: true });

export const blogModel = model<BlogSchemaInterface>("Blog", blogSchema);
