import { UserModal } from "./User";
import { LikeModel } from "./Likes";
import { CommentModel } from "./Comments";
import { BlogModel } from "./Blog";
import { Sequelize } from "sequelize";

interface Modals {
  Blog: ReturnType<typeof BlogModel>,
  User: ReturnType<typeof UserModal>,
  like: ReturnType<typeof LikeModel>,
  comment: ReturnType<typeof CommentModel>,
}
export const AllModal = (sequelize: Sequelize): Modals => {
  return {
    User: UserModal(sequelize),
    like: LikeModel(sequelize),
    comment: CommentModel(sequelize),
    Blog: BlogModel(sequelize),
  }
}