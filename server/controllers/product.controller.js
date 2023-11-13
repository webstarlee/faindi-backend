import { Product, Category, User, Profile, Notification } from "../models";
import ValidateProductInput from "../validation/product";
import createNotification from "../helpers/notification";

async function getAllProductsCategories(req, res) {
  const users = await User.find({});
  const categories = await Category.find({});
  const products = await Product.find({ sell_disable: false });
  let result_products = [];
  products?.map((product) => {
    const product_users = users.filter(
      (user) => user._id.toString() === product.owner
    );
    const product_categories = categories.filter(
      (category) => category._id.toString() === product.category_id
    );
    if (product_users.length > 0 && product_categories.length > 0) {
      const single_product = {
        _id: product._id,
        owner: product_users[0],
        category: product_categories[0],
        title: product.title,
        medias: product.medias,
        size: product.size,
        quantity: product.quantity,
        price: product.price,
        reduced_price: product.reduced_price,
        description: product.description,
        likes: product.likes,
        feedbacks: product.feedbacks,
      };
      result_products.push(single_product);
    }
  });

  res.status(200).json({
    success: true,
    products: result_products,
    categories: categories,
  });
}

async function saveProduct(req, res) {
  const me = await User.findById(req.id);
  if (!me) {
    return res.status(401).send({ message: "Permission  denied" });
  }

  //Form Valdiation
  const { errors, isValid } = ValidateProductInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { medias, title, quantity, price, description, category_id, size } =
    req.body;

  const category = await Category.findById(category_id);
  if (!category) {
    return res.status(400).send({ message: "Can not find Category" });
  }

  const newProduct = await new Product({
    owner: req.id,
    medias,
    quantity,
    title,
    price,
    description,
    category_id,
    size,
  }).save();

  const product = {
    _id: newProduct._id,
    owner: me,
    category: category,
    title: newProduct.title,
    medias: newProduct.medias,
    size: newProduct.size,
    quantity: newProduct.quantity,
    price: newProduct.price,
    reduced_price: newProduct.reduced_price,
    description: newProduct.description,
    likes: newProduct.likes,
    feedbacks: newProduct.feedbacks,
    sell_disable: false,
  };

  return res.json({
    success: true,
    message: "Your product has been added.",
    product: product,
  });
}

async function updateProduct(req, res) {
  const me = await User.findById(req.id);
  if (!me) {
    return res.status(401).send({ message: "Permission  denied" });
  }

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
    reduced_price,
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
    product.reduced_price = reduced_price;

    const newone = await product.save();

    const category = await Category.findById(category_id);

    const finalProduct = {
      _id: newone._id,
      owner: me,
      category: category,
      title: newone.title,
      medias: newone.medias,
      size: newone.size,
      quantity: newone.quantity,
      price: newone.price,
      reduced_price: newone.reduced_price,
      description: newone.description,
      likes: newone.likes,
      feedbacks: newone.feedbacks,
      sell_disable: newone.sell_disable,
    };

    if (category) {
      return res.json({
        success: true,
        message: "successfully updated",
        product: finalProduct,
      });
    }

    return res.status(400).json("Wrong Api call!");
  } else {
    return res.status(400).json("Not found Product!");
  }
}

async function likeProduct(req, res) {
  const me = await User.findById(req.id);
  if (!me) {
    return res.status(401).send({ message: "Permission  denied" });
  }

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
      const notify_content = `@${me.username} favorited your listing '${product.title}'`;
      await createNotification(
        newone.owner,
        me._id,
        "common",
        notify_content,
      );
    }
    return res.json({
      success: true,
      message: "You liked the product.",
      product: newone,
    });
  }
}

async function feedBack(req, res) {
  const me = await User.findById(req.id);
  if (!me) {
    return res.status(401).send({ message: "Permission  denied" });
  }

  const { product_id, rate, comment } = req.body;

  const product = await Product.findById(product_id);
  if (!product) {
    return res.status(400).json({
      success: false,
      message: "Not found product.",
    });
  }

  product.feedbacks.push({ rate, comment, user_id: req.id });
  const newone = await product.save();

  const notify_content = `@${me.username} has left you a review`;
  await createNotification(
    product.owner,
    me._id,
    "review",
    notify_content,
    rate
  );
  
  return res.status(200).json({
    success: true,
    product: newone,
    message: "You has given a feedback successfully.",
  });
}

export {
  getAllProductsCategories,
  saveProduct,
  updateProduct,
  likeProduct,
  feedBack,
};
