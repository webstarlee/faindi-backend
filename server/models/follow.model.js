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
    created_at: {
      type: Date,
      default: new Date(),
    },
  })
);

export default Follow;
