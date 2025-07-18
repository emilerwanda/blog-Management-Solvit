import { model, Schema, InferSchemaType } from 'mongoose'

const UserSchema = new Schema({
    name: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: String,
    isActive: Boolean,
    gender: String,
    role: {
        type: String,
        default: 'normal user'
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    updatedAt: {
        type: Date,
        default: new Date()
    },
    deletedAt: {
        type: Date

    }
})
type Users = InferSchemaType<typeof UserSchema>

export const UserModel = model<Users>('Users',UserSchema)