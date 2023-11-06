import { Notification, Profile } from "../models";

const createNotification = function (fromUserId, toUserId, content) {
  return new Promise(async (resolve, reject) => {
    try {
      if (fromUserId && toUserId && content) {
        const profile = await Profile.findOne({ user_id: fromUserId });
        if (!profile) reject();

        const notification = new Notification({
          fromUserId,
          toUserId,
          content: profile.handle + " " + content,
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
