import createNotification from "../helpers/notification";
import { Follow, User } from "../models";

async function follow(req, res) {
  const { user_id } = req.body;
  if (user_id) {
    const follower = await Follow.findOne({
      follower: req.id,
      following: user_id,
    });
    if (follower) {
      follower.liked = !follower.liked;
      const result = await follower.save();
      if (result.liked) {
        await createNotification(
          req.id,
          user_id,
          "started following you again on FAINDI"
        );
      } else {
        await createNotification(
          req.id,
          user_id,
          "caneled following you again on FAINDI"
        );
      }
      const following = await User.findById(user_id);
      const user = {
        user_id: following._id,
        fullname: following.fullname,
        username: following.username,
        email: following.email,
        avatar: following.avatar,
        title: following.title,
        bio: following.bio,
        liked: result.liked,
      };
      return res.json({
        success: true,
        user: user,
      });
    } else {
      const follow = new Follow({
        follower: req.id,
        following: user_id,
        liked: true,
      });
      const result = await follow.save();
        await createNotification(
          req.id,
          user_id,
          "started following you on FAINDI"
        );
      const following = await User.findById(user_id);
      const user = {
        user_id: following._id,
        fullname: following.fullname,
        username: following.username,
        email: following.email,
        avatar: following.avatar,
        title: following.title,
        bio: following.bio,
        liked: true,
      };
      return res.json({
        success: true,
        user: user,
      });
    }
  }
}

export { follow };
