import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import { DB, MongoUri } from "./config/db.config";
import { categorySeed, roleAdminSeed } from "./seeds";
import {
  authRoutes,
  userRoutes,
  productRoutes,
  profileRoutes,
  cartRoutes,
} from "./routes/index";
import mongoose from "./models";
import swaggerDoc from "./swaggerDoc.js";
var app = express();
app.use(cors());
app.use(logger("dev"));
app.use(express.json({ limit: "500mb" }));
app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "500mb" }));
app.use(express.urlencoded({ extended: false, limit: "500mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDoc, {
    swaggerOptions: {
      validatorUrl: null,
    },
  })
);

mongoose
  .connect(`${MongoUri}`, {
    useNewUrlParser: true,
    dbName: DB,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

cartRoutes(app);
authRoutes(app);
userRoutes(app);
productRoutes(app);
profileRoutes(app);

function initial() {
  roleAdminSeed();
  categorySeed();
}

export default app;
