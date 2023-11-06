import {
  getAllProductsCategories,
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

  app.get("/api/items", getAllProductsCategories);
}
