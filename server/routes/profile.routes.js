import { updateAvatar, updateCover, updatePassword, updateUserInfo } from "../controllers/profile.controller";
import { authJwt } from "../middlewares";


export default function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  
  app.post("/api/profile/update/avatar", authJwt.verifyToken, updateAvatar)
  app.post("/api/profile/update/cover", authJwt.verifyToken, updateCover)
  app.post("/api/profile/update/info", authJwt.verifyToken, updateUserInfo)
  app.post("/api/profile/update/password", authJwt.verifyToken, updatePassword)
};
