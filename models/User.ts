import mongoose, { Schema, model, models } from "mongoose"

export interface IUser {
  id: string
  name: string
  email: string
  password?: string
  avatar?: string
  status: "online" | "away"
  color: string
  lastSeen: Date
  token?: string
}

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String },
    status: { type: String, enum: ["online", "away"], default: "online" },
    color: { type: String, required: true },
    lastSeen: { type: Date, default: Date.now },
    token: { type: String },
  },
  { timestamps: true }
)

// Ensure uniqueness of the id field
UserSchema.index({ id: 1 })

const UserModel = models.User || model<IUser>("User", UserSchema)

export default UserModel
