import { Category, Product, User } from "../models";
import validateProfileInput from "../validation/profile";
import { hashSync, compareSync } from "bcryptjs";

async function getProfileItems(req, res) {
  const me = await User.findById(req.id);
  if (!me) {
    return res.status(401).send({ message: "Permission  denied" });
  }
  const users = await User.find({});
  const categories = await Category.find({});
  const related_products = await Product.find({"$or": [{"likes.user_id": me._id}, {owner: me._id}]});

  var own_products = [];
  var like_products = [];

  related_products.map((product, _index) => {
    const product_user = users.filter((user) => user._id.toString() === product.owner);
    const product_category = categories.filter(
      (category) => category._id.toString() === product.category_id
    );
    const single_product = {
      _id: product._id,
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

    if (product.owner == me._id) {
      own_products.push(single_product);
    } else {
      like_products.push(single_product);
    }
  });

  var feedbacks = [];
  var total_feedback_count = 0;
  var total_rate_sum = 0;
  own_products.map((product, _index) => {
    if (product.feedbacks.length > 0) {
      const rate_sum = product.feedbacks.map(feedback => feedback.rate).reduce((prev, curr) => prev + curr, 0);
      total_rate_sum += rate_sum;
      const feedback_count = product.feedbacks.length;
      const average_rate = Math.round(rate_sum/feedback_count);
      total_feedback_count += feedback_count;
      const max_feedback = product.feedbacks.reduce((max, item) => (item.rate > max.rate ? item : max), product.feedbacks[0]);
      const best_feedback_text = max_feedback.comment;
      const single_feedback = {
        product: product,
        rate: average_rate,
        comment: best_feedback_text
      };
      feedbacks.push(single_feedback);
    }
  });

  const totral_rate_average = Math.round(total_rate_sum/total_feedback_count);

  return res.status(200).send({
    own_products: own_products,
    like_products: like_products,
    feedbacks: feedbacks,
    total_rate: totral_rate_average,
    total_feedback_count: total_feedback_count
  });
}

async function getProfile(req, res) {
  const user_id = req.id;
  console.log(user_id);
  const users = await User.find({});
  const categories = await Category.find({});

  const products = await Product.find({ owner: user_id });

  let feedbackResult = [];
  let feedbackCount = 0;
  let feedbackRate = 0;
  let productsResult = [];
  const filteredProducts = products.filter((product) => {
    return product.likes.some((like) => like.user_id === user_id);
  });
  const favoritedProductResult = filteredProducts.map((product) => {
    const product_category = categories.filter(
      (category) => category._id.toString() === product.category_id
    );
    const product_user = users.filter(
      (user) => user._id.toString() === product.owner.toString()
    );
    return {
      product_id: product._id,
      category: product_category[0],
      owner: product_user[0],
      title: product.title,
      medias: product.medias,
      price: product.price,
      description: product.description,
      size: product.size,
      quantity: product.quantity,
      likes: product.likes,
      feedbacks: product.feedbacks,
    };
  });
  for (const product of products) {
    const product_category = categories.filter(
      (category) => category._id.toString() === product.category_id
    );
    const product_user = users.filter(
      (user) => user._id.toString() === product.owner
    );

    productsResult.push({
      product_id: product._id,
      category: product_category[0],
      owner: product_user[0],
      title: product.title,
      medias: product.medias,
      price: product.price,
      description: product.description,
      size: product.size,
      quantity: product.quantity,
      likes: product.likes,
      feedbacks: product.feedbacks,
    });

    let totalRate = 0;
    let count = 0;
    let maxFeedback = {
      rate: 0,
      comment: "",
    };
    if (product.feedbacks.length) {
      maxFeedback.comment = product.feedbacks[0].comment;
      for (const feedback of product.feedbacks) {
        totalRate += feedback.rate;
        count++;
        feedbackCount++;
        if (maxFeedback.rate < feedback.rate) {
          maxFeedback = feedback;
        }
      }
      let rate = totalRate / count;
      feedbackRate += rate;
      let comment = maxFeedback.comment;
      feedbackResult = [
        {
          rate,
          comment,
          product_id: product._id,
          title: product.title,
          media: product.medias[0],
          price: product.price,
        },
        ...feedbackResult,
      ];
    }
  }

  return res.status(200).json({
    success: true,
    products: productsResult,
    favorited_products: favoritedProductResult,
    feedbacks: feedbackResult,
    feedback_count: feedbackCount,
    feedback_rate: feedbackResult.length
      ? feedbackRate / feedbackResult.length
      : 0,
  });
}

async function updateAvatar(req, res) {
  const { avatar } = req.body;
  const user = await User.findById(req.id);
  if (!user) {
    return res.status(401).send({ message: "Permission  denied" });
  }

  user.avatar = avatar;
  await user.save();
  
  return res.status(200).json({
    success: true,
    message: "Your photo has changed successfullly.",
    user: {
      user_id: user._id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      title: user.title,
      bio: user.bio,
      cover: user.cover,
    },
  });
}

async function updateCover(req, res) {
  const { cover } = req.body;
  const user = await User.findById(req.id);
  if (!user) {
    return res.status(401).send({ message: "Permission  denied" });
  }

  user.cover = cover;
  await user.save()

  return res.status(200).json({
    success: true,
    message: "Your cover image has changed successfullly.",
    user: {
      user_id: user._id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      title: user.title,
      bio: user.bio,
      cover: user.cover,
    },
  });
}

async function updateUserInfo(req, res) {
  const { errors, isValid } = validateProfileInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const { fullname, username, title, bio } = req.body;

  const user = await User.findById(req.id);

  if (!user) {
    return res.status(401).send({ message: "Permission  denied" });
  }

  user.fullname = fullname;
  user.title = title;
  user.bio = bio;
  const error_msg = "";
  if (user.username !== username) {
    const exist_user = await User.findOne({ username: username });
    if (exist_user) {
      error_msg = "Username already taken.";
    } else {
      user.username = username;
    }
  }

  const newone = await user.save();

  return res.status(200).json({
    success: true,
    message: error_msg,
    user: {
      user_id: newone._id,
      fullname: newone.fullname,
      username: newone.username,
      email: newone.email,
      avatar: newone.avatar,
      title: newone.title,
      bio: newone.bio,
      cover: newone.cover,
    },
  });
}

async function updatePassword(req, res) {
  const { new_password, old_password } = req.body;
  const user = await User.findById(req.id);
  if (user) {
    const passwordMatch = compareSync(old_password, user.password);
    if (passwordMatch) {
      user.password = hashSync(new_password, 8);
      user.save().then((user) => {
        return res.status(200).json({
          success: true,
          message: "Your password has been changed successfully.",
        });
      });
    } else {
      return res.json({
        success: false,
        message: "Your old password is not correct.",
      });
    }
  }
}

export {
  updateAvatar,
  updateCover,
  updateUserInfo,
  updatePassword,
  getProfileItems,
  getProfile,
};
