import { model, Schema } from "mongoose";

const Order = model(
  "Order",
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
    product_id: {
      type: String,
      ref: "Product",
    },
    shipped: {
      type: Boolean,
      default: false,
    },
    ready_pick: {
      type: Boolean,
      default: false,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
    created_at: {
      type: Date,
      default:() => { return new Date() },
    },
  })
);

export default Order;
