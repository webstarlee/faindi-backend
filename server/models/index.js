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
