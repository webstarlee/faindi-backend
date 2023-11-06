import { Product, Category, User, Profile } from "../models";
import ValidateProductInput from "../validation/product";
import createNotification from "../helpers/notification";

async function getAllProductsCategories(req, res) {
  const products = await Product.find({});
  const all_categories = await Category.find({});

  res.status(200).json({
    success: true,
    products: products,
    categories: all_categories,
  });
}

async function getAllProductsCategoriesByUserId(req, res) {
  const products = await Product.find({
    $nor: [{ owner: req.id }],
  });

  const resdata = products?.map((product) => {
    const isLiked = product.likes.some(
      (like) => like.user_id.toString() === req.id.toString()
    );
    return {
      ...product._doc,
      liked: isLiked,
    };
  });
  const all_categories = await Category.find({});

  res.status(200).json({
    success: true,
    products: resdata,
    categories: all_categories,
  });
}

async function getAllProductsByProfile(req, res) {
  const owner = req.id;
  const products = await Product.find({ owner });
  const resdata = products?.map((product) => {
    const isLiked = product.likes.some(
      (like) => like.user_id.toString() === req.id.toString()
    );
    return {
      ...product._doc,
      liked: isLiked,
    };
  });
  res.status(200).json({
    success: true,
    products: resdata,
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
      // await createNotification(
      //   req.id,
      //   newone.user_id,
      //   `favorited your listing "${newone.title}"`
      // );
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
  getAllProductsCategoriesByUserId,
  getAllProductsByProfile,
  saveProduct,
  updateProduct,
  likeProduct,
  feedBack,
};
