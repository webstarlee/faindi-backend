import { model, Schema } from "mongoose";

const Chat = model(
  "Chat",
  new Schema({
    users: [
      {
        user_id: {
          type: String,
          required: true,
        },
      },
    ],
    buyers: [
      {
        user_id: {
          type: String,
          required: true,
        },
      },
    ],
    sellers: [
      {
        user_id: {
          type: String,
          required: true,
        },
      },
    ],
    sender: {
        type: String,
        required: true,
    },
    unread_count: [
      {
        user_id: {
          type: String,
          required: true,
        },
      },
    ],
  })
);

export default Chat;
