import {
  getProfile,
  getProfileItems,
  updateAvatar,
  updateCover,
  updatePassword,
  updateUserInfo,
  updateEmailFullname,
  deleteProfile,
  sendEmailVerify,
  emailVerify
} from "../controllers/profile.controller";
import { authJwt } from "../middlewares";

export default function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/profile/items", authJwt.verifyToken, getProfileItems);
  app.post("/api/profile/update/avatar", authJwt.verifyToken, updateAvatar);
  app.post("/api/profile/update/cover", authJwt.verifyToken, updateCover);
  app.post("/api/profile/update/info", authJwt.verifyToken, updateUserInfo);
  app.post("/api/profile/update/password", authJwt.verifyToken, updatePassword);
  app.post("/api/profile/update/fullname-email", authJwt.verifyToken, updateEmailFullname);
  app.post("/api/profile/send-email-verify", authJwt.verifyToken, sendEmailVerify);
  app.post("/api/profile/email-verify", authJwt.verifyToken, emailVerify);
  app.get("/api/profile/mine", authJwt.verifyToken, getProfile);
  app.get("/api/profile/delete", authJwt.verifyToken, deleteProfile);
}
