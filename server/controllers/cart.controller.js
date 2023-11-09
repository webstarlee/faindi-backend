import { User, Product, Category, Order, Cart } from "../models";

export async function addCart(req, res) {
  const me = await User.findById(req.id);
  if (!me) {
    return res.status(401).send({ message: "Permission  denied" });
  }

  const { product_id } = req.body;

  const product = await Product.findById(product_id);

  console.log(product)
  if (!product) {
    return res.status(404).send({ message: "Product can not find" });
  }

  if (Number(product.quantity) === Number(product.sold)) {
    return res.status(404).send({ message: "Product already sold out!" });
  }

  console.log("passed quantity");
  const cart = await Cart.findOne({ seller_id: product.owner });
  if (cart) {
    const checkCartProduct = cart.products.filter(
      (prod) => prod.product_id.toString() === product._id.toString()
    );
    if (checkCartProduct.length>0) {
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

  if (filtered_products.length>0) {
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
  })

  const cart_related_products = await Product.find({_id: {"$in": cart_product_ids}});
  var outdated_product_ids = [];
  cart_related_products?.map((product) => {
    if (Number(product.quantity) <= Number(product.sold)) {
      outdated_product_ids.push(product._id)
    }
  });

  if (outdated_product_ids.length>0) {
    console.log("order incompleted")
    var message = ""
    const outdated_products = cart_related_products.filter((prod) => outdated_product_ids.includes(prod._id));
    outdated_products.map((out_prod) => {
      if (message === "") {
        message = out_prod.title;
      } else {
        message = message+", "+out_prod.title;
      }
    });

    return res.status(400).send({
      message: "Products "+message+" already sold out !"
    });
  }

  var sold_product_ids = [];
  var orderDatas = [];
  cart_related_products?.map((product) => {
    const single_order = {
      seller_id: product.owner,
      buyer_id: me._id,
      product_id: product._id,
    };
    orderDatas.push(single_order);
    sold_product_ids.push(product._id)
  });

  const newOrders = await Order.insertMany(orderDatas);

  console.log(newOrders);
  var newOrderDatas = [];
  newOrders.map((_new_orders) => {
    const order_product = cart_related_products.filter((_order_prod) => _order_prod._id.toString() === _new_orders.product_id.toString())[0]
    const single_ord_data = {
      _id: _new_orders._id,
      seller: seller,
      product: order_product,
      orderTime: _new_orders.created_at,
      delivered: _new_orders.delivered,
    };

    newOrderDatas.push(single_ord_data)
  })

  await Product.updateMany(
    { _id: { $in: sold_product_ids } },
    { $inc: { sold: 1 } }
  );

  await cart.deleteOne();

  return res.status(200).send({
    message: "Order completed!",
    orders: newOrderDatas
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
    message: "Order Delivered"
  });
}
