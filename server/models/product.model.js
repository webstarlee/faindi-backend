import { model, Schema } from "mongoose";

const Product = model(
  "Product",
  new Schema({
    owner: {
      type: String,
      ref: "User",
    },
    category_id: {
      type: String,
      ref: "Category",
    },
    title: {
      type: String,
      required: true,
    },
    medias: [
      {
        media_type: {
          type: String,
        },
        uri: {
          type: String,
        },
      },
    ],
    size: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    likes: [
      {
        user_id: {
          type: String,
        },
      },
    ],
    feedbacks: [
      {
        user_id: {
          type: String,
        },
        rate: {
          type: Number,
          default: 0,
        },
        comment: {
          type: String,
        },
        created_at: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    created_at: {
      type: Date,
      default: new Date(),
    },
  })
);

export default Product;
