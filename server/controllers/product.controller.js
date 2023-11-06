import { Product, Category, User, Profile } from "../models";
import ValidateProductInput from "../validation/product";
import createNotification from "../helpers/notification";

async function getAllProductsCategories(req, res) {
  const users = await User.find({});
  const categories = await Category.find({});
  const products = await Product.find({});

  let result_products = [];

  products?.map((product) => {
    const product_user = users.filter((user) => user._id === product.owner);
    const product_category = categories.filter((category) => category._id === product.category_id);

    const single_product = {
      owner: product_user,
      category: product_category,
      title: product.title,
      medias: product.medias,
      size: product.size,
      quantity: product.quantity,
      sold: product.sold,
      price: product.price,
      description: product.description,
      likes: product.likes,
      feedbacks: product.feedbacks,
    }
    result_products.push(single_product);
  })
  return res.status(200).json({
    products: result_products,
    categories: categories,
  });
}

export {
  getAllProductsCategories,
};
