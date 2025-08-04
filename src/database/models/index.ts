import { UserModal } from "./User";
import { LikeModel } from "./Likes";
import { CommentModel } from "./Comments";
import { BlogModel } from "./Blog";
import { Sequelize } from "sequelize";
import { SubscriberModel } from './Subscriber';
import { TokenModel } from "./Token";

interface Modals {
  Blog: ReturnType<typeof BlogModel>,
  User: ReturnType<typeof UserModal>,
  like: ReturnType<typeof LikeModel>,
  comment: ReturnType<typeof CommentModel>,
  subscriber: ReturnType<typeof SubscriberModel>,
  token: ReturnType<typeof TokenModel>
}
export const AllModal = (sequelize: Sequelize): Modals => {
  return {
    User: UserModal(sequelize),
    like: LikeModel(sequelize),
    comment: CommentModel(sequelize),
    Blog: BlogModel(sequelize),
    subscriber: SubscriberModel(sequelize),
    token: TokenModel(sequelize),
  }
}
