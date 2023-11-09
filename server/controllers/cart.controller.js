import { User, Product, Category, Follow, Cart } from "../models";

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

  if (Number(product.quantity) === Number(product.sold)) {
    return res.status(404).send({ message: "Product already sold out!" });
  }

  const cart = await Cart.findOne({ seller_id: product.owner });
  if (cart) {
    const checkCartProduct = cart.products.filter(
      (prod) => prod.product_id.toString() === product._id.toString()
    );
    if (checkCartProduct) {
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

  if (Number(product.quantity) === Number(product.sold)) {
    return res.status(404).send({ message: "Product already sold out!" });
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
