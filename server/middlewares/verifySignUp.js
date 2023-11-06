import { User, ROLES } from "../models";

const checkDuplicateEmail = (req, res, next) => {
  // email
  User.findOne({
    email: req.body.email,
  }).exec().then((user) => {
    if (user) {
      res.status(400).send({ message: "Failed! email is already in use!" });
      return;
    }
    next();
  });
};

const checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: `Failed! Role ${req.body.roles[i]} does not exist!`,
        });
        return;
      }
    }
  }

  next();
};

const verifySignUp = {
  checkDuplicateEmail,
  checkRolesExisted,
};

export default verifySignUp;
