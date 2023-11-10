import { Schema, model } from "mongoose";

const Notification = model(
  "Notification",
  new Schema(
    {
      fromUserId: {
        type: String,
        required: true,
      },
      toUserId: {
        type: String,
        required: true,
      },
      content: {
        type: String,
      },
      isReview: {
        type: Boolean,
        default: false,
      },
      rate: {
        type: Number,
        required: true,
      },
      read: {
        type: Boolean,
        default: false,
      },
      created_at: {
        type: Date,
        default: () => { return new Date() },
      },
    },
    { timestamps: false }
  )
);

export default Notification;
