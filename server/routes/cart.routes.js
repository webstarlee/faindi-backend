import { authJwt } from "../middlewares";
import {
    addCart,
    updateCart
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
};
