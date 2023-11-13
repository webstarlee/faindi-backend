import { io } from "../bin/www";
import { User, Chat, Message } from "../models";

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
    const other = chat.users.filter(
      (_user) => _user.user_id.toString() !== me._id.toString()
    )[0];
    chat_user_ids.push(other.user_id);
  });

  const chat_messages = await Message.find({ chat_id: { $in: chat_ids } });
  const chat_users = await User.find({ _id: { $in: chat_user_ids } });

  var final_chats = [];
  chats.map((chat) => {
    const _chat_messages = chat_messages.filter(
      (_message) => _message.chat_id.toString() === chat._id.toString()
    );
    var unread_count = 0;
    _chat_messages.map((_chat_message) => {
      if (
        _chat_message.receiver_id.toString() === me._id.toString() &&
        !_chat_message.is_read
      ) {
        unread_count += 1;
      }
    });

    const sorted_messages = _chat_messages.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const chat_user_id = chat.users.filter(
      (_user) => _user.user_id.toString() !== me._id.toString()
    )[0].user_id;

    const user = chat_users.filter(
      (_user) => _user._id.toString() === chat_user_id.toString()
    )[0];

    const sellers = chat.sellers.filter(
      (_user) => _user.user_id.toString() === me._id.toString()
    );

    const single_chat = {
      user: user,
      messages: sorted_messages,
      updated_at: sorted_messages[0].created_at,
      unread_count: unread_count,
      is_seller: sellers.length > 0 ? true : false,
    };
    final_chats.push(single_chat);
  });

  const sorted_chats = final_chats.sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  return res.status(200).send({
    message: "success call api",
    chats: sorted_chats,
  });
}

export async function saveMessage(req) {
  const { from_user_id, to_user_id, message, medias } = req;

  const chat = await Chat.findOne({
    $and: [{ "users.user_id": from_user_id }, { "users.user_id": to_user_id }],
  });

  const user = await User.findById(from_user_id);
  const user_data = {
    _id: user._id,
    avatar: user.avatar,
    cover: user?.cover,
    fullname: user.fullname,
    email: user.email,
    username: user.username,
    title: user?.title,
    bio: user?.bio,
  };

  if (chat) {
    const unread_count = chat.unread_count.filter(
      (unread) => unread.user_id.toString() === to_user_id
    )?.length;

    const new_message = await new Message({
      chat_id: chat._id,
      receiver_id: to_user_id,
      sender_id: from_user_id,
      is_faindi: false,
      is_read: false,
      content: message,
      medias: medias,
    }).save();

    const chat_messages = await Message.find({ chat_id: chat._id }).sort({
      created_at: 1,
    });

    const response_data = {
      user: user_data,
      messages: chat_messages,
      unread_count: unread_count + 1,
      is_seller: chat.is_seller,
      updated_at: Date.now(),
    };
    console.log(response_data);

    io.to(to_user_id).emit("new_chat", response_data);
  } else {
    const new_chat = new Chat({
      users: [{ user_id: from_user_id }, { user_id: to_user_id }],
      buyers: [{ user_id: from_user_id }],
      sellers: [{ user_id: to_user_id }],
      sender: from_user_id,
      unread_count: [{ user_id: to_user_id }],
    });

    await new_chat.save();

    const new_message = await new Message({
      chat_id: new_chat._id,
      receiver_id: to_user_id,
      sender_id: from_user_id,
      is_faindi: false,
      is_read: false,
      content: message,
      medias: medias,
    }).save();

    const response_data = {
      user: user_data,
      messages: [new_message],
      unread_count: 1,
      is_seller: false, // not sure what is_seller is...
      updated_at: Date.now(), // not sure how to get update_at
    };

    console.log(response_data);
    io.to(to_user_id).emit("new_chat", response_data);
  }
}

export async function readMessage(param) {
  const { from_user_id, to_user_id } = param;
  const chat = await Chat.findOne({
    $and: [{ "users.user_id": from_user_id }, { "users.user_id": to_user_id }],
  });

  if (chat) {
    const unread_messages = await Message.find({"$and": [{receiver_id: from_user_id}, {chat_id: chat._id}, {is_read: false}]});

    const tmpMedias = await Promise.all([
      ...unread_messages?.map(async (message) => {
        message.is_read = true;
        await message.save()
        return message;
      }),
    ]);

    const filter_unread = chat.unread_count.filter((unread) => unread.user_id.toString() !== from_user_id.toString());
    chat.unread_count = filter_unread;
    await chat.save();
  }
}

export async function sendMessageFromPostman(req, res) {
  const me = await User.findById(req.id);
  if (!me) {
    return res.status(401).send({ message: "Permission denied" });
  }

  const from_user_id = me._id;

  const { to_user_id, message, medias } = req.body;

  const chat = await Chat.findOne({
    $and: [{ "users.user_id": me._id }, { "users.user_id": to_user_id }],
  });

  const user_data = {
    _id: me._id,
    avatar: me.avatar,
    cover: me?.cover,
    fullname: me.fullname,
    email: me.email,
    username: me.username,
    title: me?.title,
    bio: me?.bio,
  };

  if (chat) {
    const unread_count = chat.unread_count.filter(
      (unread) => unread.user_id.toString() === to_user_id
    )?.length;

    const new_message = await new Message({
      chat_id: chat._id,
      receiver_id: to_user_id,
      sender_id: from_user_id,
      is_faindi: false,
      is_read: false,
      content: message,
      medias: medias,
    }).save();

    const chat_messages = await Message.find({ chat_id: chat._id }).sort({
      created_at: 1
    });

    const response_data = {
      user: user_data,
      messages: chat_messages,
      unread_count: unread_count + 1,
      is_seller: false, // not sure what is_seller is...
      updated_at: Date.now(), // not sure how to get update_at
    };
    console.log(response_data);

    io.to(to_user_id).emit("new_chat", response_data);
  } else {
    const new_chat = new Chat({
      users: [{ user_id: from_user_id }, { user_id: to_user_id }],
      buyers: [{ user_id: from_user_id }],
      sellers: [{ user_id: to_user_id }],
      sender: from_user_id,
      unread_count: [{ user_id: to_user_id }],
    });

    await new_chat.save();

    const new_message = await new Message({
      chat_id: new_chat._id,
      receiver_id: to_user_id,
      sender_id: from_user_id,
      is_faindi: false,
      is_read: false,
      content: message,
      medias: medias,
    }).save();

    const response_data = {
      user: user_data,
      messages: [new_message],
      unread_count: 1,
      is_seller: false, // not sure what is_seller is...
      updated_at: Date.now(), // not sure how to get update_at
    };

    console.log(response_data);
    io.to(to_user_id).emit("new_chat", response_data);
  }

  return res.status(200).send({ message: "sent msg" });
}
