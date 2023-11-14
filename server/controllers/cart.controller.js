import { io } from "../bin/www";
import { User, Product, Message, Order, Cart, Chat } from "../models";
import createNotification from "../helpers/notification";

export async function addCart(req, res) {
  const me = await User.findById(req.id);
  if (!me) {
    return res.status(401).send({ message: "Permission  denied" });
  }

  const { product_id } = req.body;

  const product = await Product.findById(product_id);

  if (!product) {
    return res.status(404).send({ message: "Product can not find" });
  }

  if (!product.is_recycle && product.sold) {
    return res.status(404).send({ message: "Product already sold out!" });
  }

  const cart = await Cart.findOne({ $and: [{ seller_id: product.owner }, { buyer_id: me._id }], });
  if (cart) {
    const checkCartProduct = cart.products.filter(
      (prod) => prod.product_id.toString() === product._id.toString()
    );
    if (checkCartProduct.length > 0) {
      return res.status(404).send({ message: "Product already carted!" });
    }

    cart.products.push({ product_id: product._id });
    await cart.save();
  } else {
    const new_cart = new Cart({
      seller_id: product.owner,
      buyer_id: me._id,
      products: [{ product_id: product._id }],
    });

    await new_cart.save();
  }

  return res.status(200).send({
    message: "Cart added successfully.",
  });
}

export async function updateCart(req, res) {
  const me = await User.findById(req.id);
  if (!me) {
    return res.status(401).send({ message: "Permission  denied" });
  }

  const { product_id } = req.body;

  const product = await Product.findById(product_id);
  if (!product) {
    return res.status(404).send({ message: "Product can not find" });
  }

  const cart = await Cart.findOne({ seller_id: product.owner });
  if (!cart) {
    return res.status(404).send({ message: "Can not find cart!" });
  }

  const filtered_products = cart.products.filter(
    (prod) => prod.product_id.toString() !== product._id.toString()
  );

  if (filtered_products.length > 0) {
    cart.products = filtered_products;
    await cart.save();
    return res.status(200).send({
      message: "Cart Product removed successfully.",
    });
  } else {
    await cart.deleteOne();
    return res.status(200).send({
      message: "Cart removed successfully.",
    });
  }
}

export async function makeOrder(req, res) {
  const me = await User.findById(req.id);
  if (!me) {
    return res.status(401).send({ message: "Permission  denied" });
  }

  const { seller_id } = req.body;

  const seller = await User.findById(seller_id);

  const cart = await Cart.findOne({ seller_id: seller_id });
  if (!cart) {
    return res.status(400).send({ message: "Cart can not find!" });
  }

  var cart_product_ids = [];
  cart.products.map((prod) => {
    cart_product_ids.push(prod.product_id);
  });

  const cart_related_products = await Product.find({
    _id: { $in: cart_product_ids },
  });
  var outdated_product_ids = [];
  cart_related_products?.map((product) => {
    if (product.sold && !product.is_recycle) {
      outdated_product_ids.push(product._id);
    }
  });

  if (outdated_product_ids.length > 0) {
    console.log("order incompleted");
    var message = "";
    const outdated_products = cart_related_products.filter((prod) =>
      outdated_product_ids.includes(prod._id)
    );
    outdated_products.map((out_prod) => {
      if (message === "") {
        message = out_prod.title;
      } else {
        message = message + ", " + out_prod.title;
      }
    });

    return res.status(400).send({
      message: "Products " + message + " already sold out !",
    });
  }

  var sold_product_ids = [];
  var orderDatas = [];
  cart_related_products?.map((product) => {
    const single_order = {
      seller_id: product.owner,
      buyer_id: me._id,
      product_id: product._id,
      shipped: true,
      ready_pick: true,
    };
    orderDatas.push(single_order);
    sold_product_ids.push(product._id);
  });

  const newOrders = await Order.insertMany(orderDatas);

  console.log(newOrders);
  var newOrderDatas = [];
  newOrders.map((_new_order) => {
    const order_product = cart_related_products.filter(
      (_order_prod) =>
        _order_prod._id.toString() === _new_order.product_id.toString()
    )[0];
    const single_ord_data = {
      _id: _new_order._id,
      seller: seller,
      product: order_product,
      orderTime: _new_order.created_at,
      shipped: _new_order.shipped,
      readyPick: _new_order.ready_pick,
      delivered: _new_order.delivered,
    };

    newOrderDatas.push(single_ord_data);
  });

  await Product.updateMany(
    { _id: { $in: sold_product_ids } },
    { sold: true }
  );

  await cart.deleteOne();

  const chat = await Chat.findOne({
    $and: [{ "users.user_id": me._id }, { "users.user_id": seller_id }],
  });

  if (chat) {
    const unread_count = chat.unread_count.filter(
      (unread) => unread.user_id.toString() === me._id
    )?.length;

    await new Message({
      chat_id: chat._id,
      receiver_id: me._id,
      sender_id: "Faindi",
      is_faindi: true,
      is_read: false,
      content:
        "The buyer has purchased the item. Thank you for using FAINDI! ✨",
      medias: [],
    }).save();

    const chat_messages = await Message.find({ chat_id: chat._id }).sort({
      created_at: 1,
    });

    const response_data = {
      user: seller,
      messages: chat_messages,
      unread_count: unread_count + 1,
      is_seller: chat.is_seller, // not sure what is_seller is...
      updated_at: Date.now(), // not sure how to get update_at
    };

    console.log(response_data);

    io.to(me._id.toString()).emit("new_chat", response_data);
  } else {
    const new_chat = new Chat({
      users: [{ user_id: me._id }, { user_id: seller_id }],
      buyers: [{ user_id: me._id }],
      sellers: [{ user_id: seller_id }],
      sender: "Faindi",
      unread_count: [{ user_id: me._id }],
    });

    await new_chat.save();

    const new_message = await new Message({
      chat_id: new_chat._id,
      receiver_id: me._id,
      sender_id: "Faindi",
      is_faindi: true,
      is_read: false,
      content:
        "The buyer has purchased the item. Thank you for using FAINDI! ✨",
      medias: [],
    }).save();

    const response_data = {
      user: seller,
      messages: [new_message],
      unread_count: 1,
      is_seller: false, // not sure what is_seller is...
      updated_at: Date.now(), // not sure how to get update_at
    };

    console.log(response_data);
    io.to(me._id.toString()).emit("new_chat", response_data);
  }

  let notify_content = `@${me.username} purchased ${orderDatas.length} ${orderDatas.length > 1? "items": "item"}`;
  let order_price = 0;
  newOrderDatas.map((order_data, index) => {
    if (index>0) {
      notify_content += ","
    }
    notify_content += " "+order_data.product.title;
    if (order_data.product.reduced_price > 0) {
      order_price += Number(order_data.product.reduced_price);
    } else {
      order_price += Number(order_data.product.price);
    }
  });

  await createNotification(
    seller._id,
    me._id,
    "order",
    notify_content,
    0,
    order_price
  );

  return res.status(200).send({
    message: "Order completed!",
    orders: newOrderDatas,
  });
}

export async function orderShipped(req, res) {
  const me = await User.findById(req.id);
  if (!me) {
    return res.status(401).send({ message: "Permission  denied" });
  }

  const { order_id } = req.body;

  const order = await Order.findById(order_id);
  if (!order) {
    return res.status(404).send({ message: "Order can not find!" });
  }

  order.shipped = true;
  await order.save();

  return res.status(200).send({
    message: "Order Shipped",
  });
}

export async function orderReadyPick(req, res) {
  const me = await User.findById(req.id);
  if (!me) {
    return res.status(401).send({ message: "Permission  denied" });
  }

  const { order_id } = req.body;

  const order = await Order.findById(order_id);
  if (!order) {
    return res.status(404).send({ message: "Order can not find!" });
  }

  order.ready_pick = true;
  await order.save();

  return res.status(200).send({
    message: "Order Ready to pick up",
  });
}

export async function orderDelivered(req, res) {
  const me = await User.findById(req.id);
  if (!me) {
    return res.status(401).send({ message: "Permission  denied" });
  }

  const { order_id } = req.body;

  const order = await Order.findById(order_id);
  if (!order) {
    return res.status(404).send({ message: "Order can not find!" });
  }

  order.delivered = true;
  await order.save();

  return res.status(200).send({
    message: "Order Delivered",
  });
}
