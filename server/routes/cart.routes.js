import { authJwt } from "../middlewares";
import {
    addCart,
    updateCart,
    makeOrder,
    orderDelivered,
    orderShipped,
    orderReadyPick
} from "../controllers/cart.controller";

export default function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  
  app.post("/api/cart/add", [authJwt.verifyToken], addCart);
  app.post("/api/cart/update", [authJwt.verifyToken], updateCart);
  app.post("/api/order/make", [authJwt.verifyToken], makeOrder);
  app.post("/api/order/shipped", [authJwt.verifyToken], orderShipped);
  app.post("/api/order/ready-pick", [authJwt.verifyToken], orderReadyPick);
  app.post("/api/order/delivered", [authJwt.verifyToken], orderDelivered);
};
