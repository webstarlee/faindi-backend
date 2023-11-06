import { model, Schema } from "mongoose";

const Follow = model(
  "Follow",
  new Schema({
    follower: {
      type: String,
      required: true,
    },
    following: {
      type: String,
      ref: "User",
      required: true,
    },
    liked: {
      type: Boolean,
      default: false,
    },
  })
);

export default Follow;
