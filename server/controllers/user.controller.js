import { User } from "../models";

export function userBoard(req, res) {
  User.findById(req.id).then((user) => {
    if (user) {
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
      });
    }
    res.status(200).json({ data: user });
  });
}