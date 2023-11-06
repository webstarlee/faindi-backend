import { secret } from "../config/auth.config";
import { User, Role, Token, Profile } from "../models";
import validateRegisterInput from "../validation/register";
import validateLoginInput from "../validation/login";
import { sign } from "jsonwebtoken";
import { hashSync, compareSync } from "bcryptjs";
import { sendEmail } from "../modules/email";
import { isWithinInterval } from "../modules/helpers";
import crypto from "crypto";

export function signup(req, res) {
  //Form validation
  const { errors, isValid } = validateRegisterInput(req);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const user = new User({
    avatar: req.body.avatar,
    fullname: req.body.fullname,
    email: req.body.email,
    username: req.body.username,
    password: hashSync(req.body.password, 8),
  });

  user.save().then(async (user) => {
    if (req.body.roles) {
      Role.find({ name: { $in: req.body.roles } }).then(async (roles) => {
        user.roles = roles.map((role) => role._id);
        await user.save();
      });
    } else {
      Role.findOne({ name: "user" }).then(async (role) => {
        user.roles = [role._id];
        await user.save();
      });
    }

    const randNum = crypto.randomInt(1000, 9999).toString();
    const token = crypto.randomBytes(32).toString("hex");
    await sendEmail(user.email, "Verification Number", randNum);
    const newToken = new Token({
      user_id: user._id,
      token: token,
      verify_number: randNum,
    });

    await newToken.save();

    return res.send({
      message: "Email verification sent!",
      token: token,
    });
  });
}

export function verify(req, res) {
  const token_hex = req.body.token;
  const verify_num = req.body.number;
  Token.findOne({
    token: token_hex,
  })
    .exec()
    .then(async (token) => {
      if (!token) {
        return res.status(400).send({ message: "Invalid Token" });
      }

      if (isWithinInterval(token.created_at)) {
        if (Number(verify_num) !== Number(token.verify_number)) {
          return res.status(401).send({
            message: "Verify code is invalid.",
          });
        }
        const user = await User.findById(token.user_id);
        if (!user) {
          return res.status(404).send({
            message: "Can not find User.",
          });
        }

        user.verified = true;

        await user.save();
        await token.deleteOne();
        
        var accesstoken = sign(
          {
            user: user,
          },
          secret,
          {
            expiresIn: 86400, // 24 hours
          }
        );

        return res.status(200).send({
          user: {
            user_id: user._id,
            fullname: user.fullname,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            title: user.title,
            bio: user.bio,
          },
          accessToken: accesstoken,
        });
      } else {
        console.log(
          "Current time is more than 15 minutes from the start time."
        );
        return res.send({ message: "Token expired!" });
      }
    });
}

export function signin(req, res) {
  //Form Valdiation
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({
    email: req.body.email,
  })
    .populate("roles", "-__v")
    .exec()
    .then(async (user) => {
      if (!user) {
        return res.status(401).send({ message: "Invalid credential" });
      }

      var passwordIsValid = compareSync(req.body.password, user.password);

      if (!passwordIsValid) {
        return res.status(401).send({
          message: "invalid credential",
        });
      }

      if (!user.verified) {
        const verify_token = await Token.findOne({
          user_id: user._id,
        });

        return res.status(403).send({
          message: "User was not verified yet!",
          email: user.email,
          token: verify_token? verify_token.token: ""
        });
      }

      var token = sign(
        {
          user: user,
        },
        secret,
        {
          expiresIn: 86400, // 24 hours
        }
      );

      return res.status(200).send({
        user: {
          user_id: user._id,
          fullname: user.fullname,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          title: user.title,
          bio: user.bio,
        },
        accessToken: token,
      });
    });
}

export async function sendVerifyEmail(req, res) {
  const email = req.body.email;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }
  await Token.findOneAndDelete({ user_id: user._id });
  const randNum = crypto.randomInt(1000, 9999).toString();
  const token = crypto.randomBytes(32).toString("hex");
  await sendEmail(user.email, "Verification Number", randNum);
  const newToken = new Token({
    user_id: user._id,
    token: token,
    verify_number: randNum,
  });

  await newToken.save();

  return res.send({
    message: "Email verification sent!",
    token: token,
    numner: randNum,
  });
}

export async function checkUsername(req, res) {
  const username = req.body.username;
  const user = await User.findOne({ username: username });
  if (!user) {
    return res.status(200).send({ result: true });
  } else {
    return res.status(200).send({ result: false });
  }
}