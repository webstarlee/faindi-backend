import { Schema, model } from "mongoose";

const Notification = model(
  "Notification",
  new Schema(
    {
      user_id: {
        type: String,
        required: true,
      },
      sender_id: {
        type: String,
        required: true,
      },
      content: {
        type: String,
      },
      notify_type: {
        type: String,
        default: "common",
      },
      rate: {
        type: Number,
        default: 0
      },
      price: {
        type: Number,
        default: 0
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
