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
    price: {
      type: Number,
      required: true,
    },
    reduced_price: {
      type: Number,
      default: 0
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
    is_recycle: {
      type: Boolean,
      default: false
    },
    sold: {
      type: Boolean,
      default: false
    },
    created_at: {
      type: Date,
      default: () => { return new Date() },
    },
  })
);

export default Product;
