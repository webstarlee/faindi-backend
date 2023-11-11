import { User, Product, Category, Follow, Chat, Message } from "../models";

function maxCreateAtDate(arr) {
    const maxTimestamp = Math.max(...arr.
        map(x => x.created_at !== null ? Date.parse(x.created_at) : -Infinity)
    );

    return (maxTimestamp !== -Infinity) ? new Date(maxTimestamp) : null;
}

export async function getChatList(req, res) {
  const me = await User.findById(req.id);
  if (!me) {
    return res.status(401).send({ message: "Permission denied" });
  }

  const chats = await Chat.find({ "users.user_id": me._id });

  if (chats.length == 0) {
    return res.status(200).send({
      message: "success call api",
      chats: [],
    });
  }

  var chat_ids = [];
  var chat_user_ids = [];

  chats.map((chat) => {
    chat_ids.push(chat._id);
    const other = chat.users.filter((_user) =>_user.user_id.toString() !== me._id.toString())[0];
    chat_user_ids.push(other.user_id);
  });

  const chat_messages = await Message.find({chat_id: {"$in": chat_ids}});
  const chat_users = await User.find({_id: {"$in": chat_user_ids}});

  var final_chats = [];
  chats.map((chat) => {
    const _chat_messages = chat_messages.filter((_message) => _message.chat_id.toString() === chat._id.toString());
    var unread_count = 0;
    _chat_messages.map((_chat_message) => {
        if ((_chat_message.receiver_id.toString() === me._id.toString()) && !_chat_message.is_read) {
            unread_count += 1;
        }
    })
    const last_message = _chat_messages.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    const chat_user = chat.users.filter((_user) =>_user.user_id.toString() !== me._id.toString())[0];
    const user = chat_users.filter((_user) =>_user._id.toString() === chat_user.user_id.toString())[0];
    const sellers = chat.sellers.filter((_user) =>_user.user_id.toString() === me._id.toString());
    const single_chat = {
        user: user,
        message: last_message,
        updated_at: last_message.created_at,
        unread_count: unread_count,
        is_seller: sellers.length>0? true: false
    }
    final_chats.push(single_chat);
  });

  const sorted_chats = final_chats.sort((a,b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  return res.status(200).send({
    message: "success call api",
    chats: sorted_chats
  });
}

export async function saveMessage(req) {
  const { from_user_id, to_user_id, message, medias } = req;

  const chat = await Chat.findOne({
    $and: [{ "users.user_id": from_user_id }, { "users.user_id": to_user_id }],
  });
  if (chat) {
    console.log("exist");
    const new_message = new Message({
      chat_id: chat._id,
      receiver_id: to_user_id,
      sender_id: from_user_id,
      is_faindi: false,
      is_read: false,
      content: message,
      medias: medias,
    });

    await new_message.save();
    console.log(new_message);
  } else {
    const new_chat = new Chat({
      users: [{ user_id: from_user_id }, { user_id: to_user_id }],
      buyers: [{ user_id: from_user_id }],
      sellers: [{ user_id: to_user_id }],
      sender: from_user_id,
      unread_count: [{ user_id: to_user_id }],
    });

    await new_chat.save();

    const new_message = new Message({
      chat_id: new_chat._id,
      receiver_id: to_user_id,
      sender_id: from_user_id,
      is_faindi: false,
      is_read: false,
      content: message,
      medias: medias,
    });

    await new_message.save();

    console.log(new_chat);
    console.log(new_message);
  }
}
