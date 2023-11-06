import { Product, Category, User, Profile, Notification } from "../models";
import ValidateProductInput from "../validation/product";
import createNotification from "../helpers/notification";

async function getAllProductsCategories(req, res) {
  const users = await User.find({});
  const categories = await Category.find({});
  const products = await Product.find({});
  let result_products = [];
  products?.map((product) => {
    const product_user = users.filter((user) => user._id.toString() === product.owner);
    const product_category = categories.filter(
      (category) => category._id.toString() === product.category_id
    );
    const single_product = {
      owner: product_user[0],
      category: product_category[0],
      title: product.title,
      medias: product.medias,
      size: product.size,
      quantity: product.quantity,
      sold: product.sold,
      price: product.price,
      description: product.description,
      likes: product.likes,
      feedbacks: product.feedbacks,
    };
    result_products.push(single_product);
  });

  res.status(200).json({
    success: true,
    products: result_products,
    categories: categories,
  });
}

async function saveProduct(req, res) {
  //Form Valdiation
  const { errors, isValid } = ValidateProductInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { medias, quantity, title, price, description, category_id, size } =
    req.body;

  new Product({
    owner: req.id,
    medias,
    quantity,
    title,
    price,
    description,
    category_id,
    size,
  })
    .save()
    .then((product) => {
      return res.json({
        success: true,
        message: "Your product has been added.",
        product,
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

async function updateProduct(req, res) {
  //Form Valdiation
  const { errors, isValid } = ValidateProductInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const {
    product_id,
    medias,
    title,
    price,
    description,
    quantity,
    category_id,
    size,
  } = req.body;

  const product = await Product.findById(product_id);
  if (product) {
    product.title = title;
    product.price = price;
    product.description = description;
    product.category_id = category_id;
    product.size = size;
    product.quantity = quantity;
    product.medias = medias;

    const newone = await product.save();
    if (newone) {
      return res.json({
        success: true,
        message: "successfully updated",
        product: newone,
      });
    }
  } else {
    return res.json({
      success: false,
      message: "Not found Product!",
    });
  }
}

async function likeProduct(req, res) {
  const { product_id } = req.body;
  const product = await Product.findById(product_id);
  if (product) {
    const isLiked = product.likes.some(
      (like) => like.user_id.toString() === req.id.toString()
    );
    if (!isLiked) {
      product.likes.push({ user_id: req.id });
    } else {
      const _index = product.likes.findIndex(
        (like) => like.user_id.toString === req.id.toString()
      );
      product.likes.splice(_index, 1);
    }
    const newone = await product.save();
    if (!isLiked) {
      try {
        await createNotification(
          req.id,
          newone.owner,
          `favorited your listing "${newone.title}"`
        );
      } catch (error) {}
    }
    return res.json({
      success: true,
      message: "You liked the product.",
      product: newone,
    });
  }
}

async function feedBack(req, res) {
  const { product_id, rate, comment } = req.body;

  let errors = {};
  if (!rate) {
    errors.rate = "Rate field is required.";
  }
  if (!comment) {
    errors.comment = "Comment field is required.";
  }

  if (Object.values(errors).length) {
    return res.status(400).json(errors);
  }

  const product = await Product.findById(product_id);
  if (product) {
    product.feedbacks.push({ rate, comment, user_id: req.id });
    const newone = await product.save();
    const user = await User.findById(req.id);
    await new Notification({
      fromUserId: req.id,
      toUserId: product.owner,
      isReview: true,
      rate: rate,
      content: user.username + " has left you a review.",
    }).save();
    return res.status(200).json({
      success: true,
      product: newone,
      message: "You has given a feedback successfully.",
    });
  } else {
    return res.status(400).json({
      success: false,
      message: "Not found product.",
    });
  }
}

export {
  getAllProductsCategories,
  saveProduct,
  updateProduct,
  likeProduct,
  feedBack,
};
