import { Notification, User } from "../models";

const createNotification = function (fromUserId, toUserId, content) {
  return new Promise(async (resolve, reject) => {
    try {
      if (fromUserId && toUserId && content) {
        const profile = await User.findById(fromUserId);
        if (!profile) reject();

        const notification = new Notification({
          fromUserId,
          toUserId,
          content: profile.username + " " + content,
        });
        const result = await notification.save();
        if (result) {
          resolve(result);
        }
      } else {
        reject();
      }
    } catch (error) {}
  });
};

export default createNotification;
