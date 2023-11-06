import { model, Schema } from "mongoose";

const User = model(
  "User",
  new Schema({
    avatar: {
      type: String,
      required: true,
    },
    cover: {
      type: String,
    },
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    title: {
      type: String,
    },
    bio: {
      type: String,
    },
    roles: [
      {
        type: Schema.Types.ObjectId,
        ref: "Role",
      },
    ],
    verified: {
      type: Boolean,
      default: false,
    },
    created_at: {
      type: Date,
      default: Date.now(),
    }
  })
);

export default User;
