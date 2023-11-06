import { Product, User } from "../models";
import validateProfileInput from "../validation/profile";
import { hashSync, compareSync } from "bcryptjs";

async function getPublicProfile(req, res) {
  const { user_id } = req.params;
  const user = await User.findById(user_id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Not found user",
    });
  }
  const products = await Product.find({ owner: user_id });
  let feedbackResult = [];
  let feedbackCount = 0;
  let feedbackRate = 0;
  let productsResult = [];
  for (const product of products) {
    productsResult.push({
      product_id: product._id,
      title: product.title,
      media: product.medias[0],
      price: product.price,
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
      feedbackRate;
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
    user: {
      user_id: user._id,
      avatar: user.avatar,
      cover: user.cover,
      fullname: user.fullname,
      username: user.username,
      bio: user.bio,
      title: user.title,
    },
    products: productsResult,
    feedbacks: feedbackResult,
    feedback_count: feedbackCount,
    feedback_rate: feedbackResult.length
      ? feedbackRate / feedbackResult.length
      : 0,
  });
}

async function getProfile(req, res) {
  const user_id = req.id;
  const user = await User.findById(user_id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Not found user",
    });
  }
  const products = await Product.find({ owner: user_id });
  let feedbackResult = [];
  let feedbackCount = 0;
  let feedbackRate = 0;
  let productsResult = [];
  const favoritedProducts = products.filter((product) => {
    return product.likes.some((like) => like.user_id === user_id);
  });
  for (const product of products) {
    productsResult.push({
      product_id: product._id,
      title: product.title,
      media: product.medias[0],
      price: product.price,
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
      feedbackRate;
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
    favorited_products: favoritedProducts,
    feedbacks: feedbackResult,
    feedback_count: feedbackCount,
    feedback_rate: feedbackResult.length
      ? feedbackRate / feedbackResult.length
      : 0,
  });
}

async function updateAvatar(req, res) {
  const { avatar } = req.body;
  User.findById(req.id).then((user) => {
    user.avatar = avatar;
    user.save().then((user) => {
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
    });
  });
}

async function updateCover(req, res) {
  const { cover } = req.body;
  User.findById(req.id).then((user) => {
    user.cover = cover;
    user.save().then((user) => {
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
    });
  });
}

async function updateUserInfo(req, res) {
  const { errors, isValid } = validateProfileInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const { fullname, email, username, title, bio } = req.body;

  const user = await User.findById(req.id);
  if (user) {
    user.fullname = fullname;
    user.title = title;
    user.bio = bio;
    if (user.email !== email) {
      user.email = email;
    }

    if (user.username !== username) {
      user.username = username;
    }
    const newone = await user.save();
    return res.status(200).json({
      success: true,
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
  } else {
    return res.status(404).json({
      success: false,
      message: "Not found user.",
    });
  }
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
  getPublicProfile,
  getProfile
};
