import { authJwt } from "../middlewares";
import {
    getChatList,
    sendMessageFromPostman
} from "../controllers/chat.controller";

export default function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  
  app.get("/api/chat/get-list", [authJwt.verifyToken], getChatList);
  app.post("/api/chat/send-msg", [authJwt.verifyToken], sendMessageFromPostman);
};
