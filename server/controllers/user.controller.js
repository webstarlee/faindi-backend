import { User, Product, Category } from "../models";

export async function userBoard(req, res) {
  console.log("call here")
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
      cover: user.cover
    },
  });
}

export async function userItems(req, res) {
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