import { model, Schema } from "mongoose";

const Category = model(
  "Category",
  new Schema({
    cat_title: {
      type: String,
      required: true,
    },
    cat_img: {
      type: String,
      required: true,
    },
  })
);

export default Category;
