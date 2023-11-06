import { verifySignUp } from "../middlewares";
import { signup, signin, verify, sendVerifyEmail, checkUsername } from "../controllers/auth.controller";

export default function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [verifySignUp.checkDuplicateEmail, verifySignUp.checkRolesExisted],
    signup
  );

  app.post("/api/auth/check-username", checkUsername);

  app.post("/api/auth/verify", verify);

  app.post("/api/auth/signin", signin);

  app.post("/api/auth/send-verify", sendVerifyEmail);
};
