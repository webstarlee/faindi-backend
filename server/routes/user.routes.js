import { authJwt } from "../middlewares";
import {
  userBoard,
  getUserProfile,
  followUser,
  unfollowUser
} from "../controllers/user.controller";

export default function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  
  app.get("/api/user/current", [authJwt.verifyToken], userBoard);
  app.get("/api/user/items/:user_id", getUserProfile);
  app.get("/api/user/follow/:user_id", authJwt.verifyToken, followUser);
  app.get("/api/user/unfollow/:user_id", authJwt.verifyToken, unfollowUser);
};
