import {
  feedBack,
  getAllProductsCategories,
  likeProduct,
  saveProduct,
  updateProduct,
} from "../controllers/product.controller";
import { authJwt } from "../middlewares";

export default function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/product/items", getAllProductsCategories);
  app.post("/api/product/create", authJwt.verifyToken, saveProduct);
  app.post("/api/product/update", authJwt.verifyToken, updateProduct);
  app.post("/api/product/like", authJwt.verifyToken, likeProduct);
  app.post("/api/product/feedback", authJwt.verifyToken, feedBack);
}
