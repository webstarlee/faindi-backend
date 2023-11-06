import { model, Schema } from "mongoose";

const Token = model(
  "Token",
  new Schema({
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    verify_number: {
      type: String,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now(),
    }
  })
);

export default Token;
