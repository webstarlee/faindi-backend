import { User, Product, Category, Follow, Notification } from "../models";

export async function userBoard(req, res) {
  const user = await User.findById(req.id);
  if (!user) {
    return res.status(401).send({ message: "Permission  denied" });
  }

  return res.status(200).send({
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

export async function getUserProfile(req, res) {
  const { user_id } = req.params;
  const user = await User.findById(user_id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Not found user",
    });
  }
  const categories = await Category.find({});
  const related_products = await Product.find({ owner: user._id });
  var user_products = [];

  related_products.map((product, _index) => {
    const product_category = categories.filter(
      (category) => category._id.toString() === product.category_id
    );
    const single_product = {
      _id: product._id,
      owner: user,
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

    user_products.push(single_product);
  });

  var feedbacks = [];
  var total_feedback_count = 0;
  var total_rate_sum = 0;
  user_products.map((product, _index) => {
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

  return res.status(200).send({
    user: user,
    user_products: user_products,
    feedbacks: feedbacks,
    total_rate: totral_rate_average,
    total_feedback_count: total_feedback_count,
  });
}

export async function followUser(req, res) {
  const me = await User.findById(req.id);
  if (!me) {
    return res.status(401).send({ message: "Permission  denied" });
  }

  const { user_id } = req.params;
  const user = await User.findById(user_id);
  const exist_follow = await Follow.findOne({
    $and: [{ follower: me._id }, { following: user_id }],
  });
  if (exist_follow) {
    return res.status(400).send({ message: "Already following" });
  }
  const new_follow = new Follow({
    follower: me._id,
    following: user._id,
  });

  await new_follow.save();

  return res.status(200).send({
    message: "Follow added",
  });
}

export async function unfollowUser(req, res) {
  const me = await User.findById(req.id);
  if (!me) {
    return res.status(401).send({ message: "Permission  denied" });
  }

  const { user_id } = req.params;
  await Follow.findOneAndDelete({
    $and: [{ follower: me._id }, { following: user_id }],
  });

  return res.status(200).send({
    message: "Deleted successfully",
  });
}

export async function newUsers(req, res) {
  const me = await User.findById(req.id);
  if (!me) {
    return res.status(401).send({ message: "Permission  denied" });
  }

  const followings = await Follow.find({ follower: me._id });
  var following_user_ids = [];
  if (followings.length > 0) {
    followings.map((follow) => {
      following_user_ids.push(follow.following);
    });
  }
  following_user_ids.push(me._id);

  const new_users = await User.find({ _id: { $nin: following_user_ids } })
    .sort({ created_at: -1 })
    .limit(3);

  var new_user_ids = [];
  if (new_users.length > 0) {
    new_users.map((new_user) => {
      new_user_ids.push(new_user._id);
    });
  }

  const new_users_products = await Product.find({
    owner: { $in: new_user_ids },
  });
  const categories = await Category.find({});

  var new_users_data = [];
  new_users.map((new_user, index) => {
    const new_user_products = new_users_products.filter(
      (prod) => prod.owner.toString() === new_user._id.toString()
    );
    var top_product = null;

    if (new_user_products.length > 0) {
      const tmp_top_product = new_user_products[0];
      const product_category = categories.filter(
        (cat) => cat._id.toString() === tmp_top_product.category_id.toString()
      );
      top_product = {
        _id: tmp_top_product._id,
        owner: new_user,
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

    const single_new_user = {
      user: new_user,
      topProduct: top_product,
    };

    new_users_data.push(single_new_user);
  });

  return res.status(200).send({
    new_users: new_users_data,
  });
}

export async function getMyNotifications(req, res) {
  const me = await User.findById(req.id);
  if (!me) {
    return res.status(401).send({ message: "Permission  denied" });
  }

  const notifications = await Notification.find({ user_id: me._id });
  if (!notifications) {
    return res.status(200).send({ notifications: [] });
  }

  let notify_user_ids = [];
  notifications.map((notify) => {
    notify_user_ids.push(notify.sender_id);
  });

  const notify_users = await User.find({ _id: { $in: notify_user_ids } });
  let user_notifications = [];
  notifications.map((notify) => {
    const notify_sender = notify_users.filter(
      (notify_user) =>
        notify_user._id.toString() === notify.sender_id.toString()
    )[0];
    if (notify_sender) {
      const single_notify = {
        sender: notify_sender,
        notify_type: notify.notify_type,
        content: notify.content,
        rate: notify.rate,
        price: notify.price,
      };
      user_notifications.push(single_notify);
    }
  });

  return res.status(200).send({ notifications: user_notifications });
}
