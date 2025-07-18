import mongoose, {model,Schema} from "mongoose"

export interface Liked extends Document {
  user: mongoose.Types.ObjectId;
  blog: mongoose.Types.ObjectId;
  createdAt: Date;
}
const commentSchema = new Schema({
  text: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: async function (userId: string) {
        const user = await mongoose.model('User').findById(userId);
        return user?.role === 'normal user';
      },
    },
  },
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
  },
}, { timestamps: true });

export const Comment = model('Comment', commentSchema);