import { Notification, User } from "../models";

const createNotification = function (user_id, sender_id, notify_type, content, rate=0, price=0) {
  return new Promise(async (resolve, reject) => {
    try {
      if (user_id && notify_type && content) {
        const user = await User.findById(user_id);
        if (!user) reject();

        const notification = new Notification({
          user_id,
          sender_id,
          content,
          notify_type,
          rate,
          price
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
