import mongoose, { Promise } from "mongoose";
mongoose.Promise = global.Promise;

export default mongoose;
export const ROLES = ["user", "admin"];
export { default as User } from "./user.model";
export { default as Role } from "./role.model";
export { default as Token } from "./token.model";
export { default as Category } from "./category.model";
export { default as Product } from "./product.model";
export { default as Follow } from "./follow.model";
export { default as Cart } from "./cart.model";
export { default as Order } from "./order.model";
export { default as Notification } from "./notification.model";
export { default as Chat } from "./chat.model";
export { default as Message } from "./message.model";
