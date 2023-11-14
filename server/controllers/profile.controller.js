import { Category, Product, User, Follow, Cart, Order, Chat, Message, Follow } from "../models";
import validateProfileInput from "../validation/profile";
import { hashSync, compareSync } from "bcryptjs";

async function getProfileItems(req, res) {
  const me = await User.findById(req.id);
  if (!me) {
    return res.status(401).send({ message: "Permission  denied" });
  }
  const users = await User.find({});
  const categories = await Category.find({});
  const related_products = await Product.find({
    $or: [{ "likes.user_id": me._id }, { owner: me._id }],
  });

  var own_products = [];
  var like_products = [];

  related_products.map((product, _index) => {
    const product_user = users.filter(
      (user) => user._id.toString() === product.owner
    );
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
      price: product.price,
      reduced_price: product.reduced_price,
      description: product.description,
      likes: product.likes,
      feedbacks: product.feedbacks,
      is_recycle: product.is_recycle,
      sold: product.sold,
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
      const rate_sum = product.feedbacks
        .map((feedback) => feedback.rate)
        .reduce((prev, curr) => prev + curr, 0);
      total_rate_sum += rate_sum;
      const feedback_count = product.feedbacks.length;
      const average_rate = Math.round(rate_sum / feedback_count);
      total_feedback_count += feedback_count;
      const max_feedback = product.feedbacks.reduce(
        (max, item) => (item.rate > max.rate ? item : max),
        product.feedbacks[0]
      );
      const best_feedback_text = max_feedback.comment;
      const single_feedback = {
        product: product,
        rate: average_rate,
        comment: best_feedback_text,
      };
      feedbacks.push(single_feedback);
    }
  });

  const totral_rate_average = Math.round(total_rate_sum / total_feedback_count);

  const my_followings = await Follow.find({ follower: me._id });
  var following_user_ids = [];
  var followings = [];
  my_followings.map((follow) => {
    following_user_ids.push(follow.following);
  });
  const followings_user_products = await Product.find({
    owner: { $in: following_user_ids },
  });

  my_followings.map((follow, index) => {
    const following_user = users.filter(
      (user) => user._id.toString() === follow.following.toString()
    )[0];
    const follow_products = followings_user_products.filter(
      (prod) => prod.owner.toString() === follow.following.toString()
    );
    var top_product = null;

    if (follow_products.length > 0) {
      const tmp_top_product = follow_products[0];
      const product_category = categories.filter(
        (cat) => cat._id.toString() === tmp_top_product.category_id.toString()
      );
      top_product = {
        _id: tmp_top_product._id,
        owner: following_user,
        category: product_category,
        title: tmp_top_product.title,
        medias: tmp_top_product.medias,
        size: tmp_top_product.size,
        price: tmp_top_product.price,
        reduced_price: tmp_top_product.reduced_price,
        description: tmp_top_product.description,
        likes: tmp_top_product.likes,
        feedbacks: tmp_top_product.feedbacks,
        is_recycle: tmp_top_product.is_recycle,
        sold: tmp_top_product.sold,
      };
    }

    const single_following = {
      user: following_user,
      topProduct: top_product,
    };

    followings.push(single_following);
  });

  const user_carts = await Cart.find({ buyer_id: me._id });
  var cart_product_ids = [];
  var cart_seller_ids = [];
  if (user_carts.length > 0) {
    user_carts.map((cart) => {
      cart_seller_ids.push(cart.seller_id);
      cart.products.map((prod) => {
        cart_product_ids.push(prod.product_id);
      });
    });
  }

  const cart_related_users = await User.find({ _id: { $in: cart_seller_ids } });
  const cart_related_products = await Product.find({
    _id: { $in: cart_product_ids },
  });

  var total_carts = [];
  user_carts.map((cart) => {
    var cart_products = [];
    cart.products.map((cart_product) => {
      const cart_single_product = cart_related_products.filter(
        (prod) => prod._id.toString() === cart_product.product_id.toString()
      )[0];
      cart_products.push(cart_single_product);
    });
    const cart_seller = cart_related_users.filter(
      (user) => user._id.toString() === cart.seller_id.toString()
    )[0];

    const single_cart = {
      seller: cart_seller,
      products: cart_products,
    };
    total_carts.push(single_cart);
  });

  const orders = await Order.find({ buyer_id: me._id });
  var order_prod_ids = [];
  orders.map((_order) => {
    order_prod_ids.push(_order.product_id);
  });

  const order_related_products = await Product.find({
    _id: { $in: order_prod_ids },
  });
  var order_datas = [];
  orders.map((_order) => {
    const ord_product = order_related_products.filter(
      (prod) => prod._id.toString() === _order.product_id.toString()
    )[0];
    const ord_product_user = users.filter(
      (user) => user._id.toString() === ord_product.owner.toString()
    )[0];
    const single_ord_product = {
      _id: _order._id,
      seller: ord_product_user,
      product: ord_product,
      orderTime: _order.created_at,
      shipped: _order.shipped,
      readyPick: _order.ready_pick,
      delivered: _order.delivered,
    };
    order_datas.push(single_ord_product);
  });

  console.log(order_datas);

  return res.status(200).send({
    own_products: own_products,
    like_products: like_products,
    feedbacks: feedbacks,
    followings: followings,
    carts: total_carts,
    orders: order_datas,
    total_rate: totral_rate_average,
    total_feedback_count: total_feedback_count,
  });
}

async function getProfile(req, res) {
  const user_id = req.id;
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
      reduced_price: product.reduced_price,
      description: product.description,
      size: product.size,
      likes: product.likes,
      feedbacks: product.feedbacks,
      is_recycle: product.is_recycle,
      sold: product.sold,
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
      reduced_price: product.reduced_price,
      description: product.description,
      size: product.size,
      likes: product.likes,
      feedbacks: product.feedbacks,
      is_recycle: product.is_recycle,
      sold: product.sold,
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
  await user.save();

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

async function updateEmailFullname(req, res) {
  const me = await User.findById(req.id);
  if (!me) {
    return res.status(401).send({ message: "Permission  denied" });
  }

  const { fullname, email } = req.body;

  me.fullname = fullname;
  me.email = email;
  await me.save();

  return res.status(200).send({ success: true });
}

async function deleteProfile(req, res) {
  const user = await User.findById(req.id);
  if (!user) {
    return res.status(401).send({ message: "Permission  denied" });
  }

  const own_products = await Product.find({owner: user._id});
  if (own_products.length === 0) {
    await Cart.deleteMany({buyer_id: user._id});
    await Order.deleteMany({buyer_id: user._id});
    await Chat.deleteMany({"users.user_id": user._id});
    await Follow.deleteMany({"$or": [{follower: user._id}, {following: user._id}]});
    await Message.deleteMany({"$or": [{receiver_id: user._id}, {sender_id: user._id}]});

    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Your Account deleted successfullly.",
    });
  }


  let own_product_ids = []
  if (own_products.length > 0) {
    own_products.map((product) => {
      own_product_ids.push(product._id);
    })
  }

  const exist_carts = await Cart.find({"products.product_id": {"$in": own_product_ids}});
  if (exist_carts.length > 0) {
    return res.status(404).json({
      success: false,
      message: "Your product put in carts.",
    });
  }

  const exist_orders = await Order.find({product_id: {"$in": own_product_ids}});

  if (exist_carts.length > 0) {
    return res.status(404).json({
      success: false,
      message: "Your product put in Orders.",
    });
  }

  await Product.deleteMany({owner: user._id});
  await Cart.deleteMany({buyer_id: user._id});
  await Order.deleteMany({buyer_id: user._id});
  await Chat.deleteMany({"users.user_id": user._id});
  await Follow.deleteMany({"$or": [{follower: user._id}, {following: user._id}]});
  await Message.deleteMany({"$or": [{receiver_id: user._id}, {sender_id: user._id}]});

  await user.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Your Account deleted successfullly.",
  });
}

export {
  updateAvatar,
  updateCover,
  updateUserInfo,
  updatePassword,
  getProfileItems,
  getProfile,
  updateEmailFullname,
  deleteProfile
};
