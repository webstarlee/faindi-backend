import { model, Schema } from "mongoose";

const Message = model(
  "Message",
  new Schema({
    chat_id: {
      type: String,
      required: true,
    },
    receiver_id: {
      type: String,
      required: true,
    },
    sender_id: {
      type: String,
      required: true,
    },
    is_faindi: {
      type: Boolean,
      default: false,
    },
    is_read: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String,
    },
    medias: [
      {
        media_type: {
          type: String,
          default: "image",
        },
        uri: {
          type: String,
          required: true,
        },
      },
    ],
    created_at: {
      type: Date,
      default: () => {
        return new Date();
      },
    },
  })
);

export default Message;
