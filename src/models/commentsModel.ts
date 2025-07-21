import mongoose, {model,Schema} from "mongoose"

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

export const CommentModel = mongoose.model('Comment', commentSchema);