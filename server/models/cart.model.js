import { model, Schema } from "mongoose";

const Cart = model(
  "Cart",
  new Schema({
    seller_id: {
      type: String,
      ref: "User",
      required: true,
    },
    buyer_id: {
      type: String,
      ref: "User",
      required: true,
    },
    products: [
      {
        product_id: {
          type: String,
          ref: "Product",
          required: true,
        },
      },
    ],
    created_at: {
      type: Date,
      default: () => { return new Date() },
    },
  })
);

export default Cart;
