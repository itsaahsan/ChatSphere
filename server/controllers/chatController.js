const asyncHandler = require('express-async-handler');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400);
    throw new Error('UserId param not sent with request');
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate('users', '-password')
    .populate('latestMessage');

  isChat = await User.populate(isChat, {
    path: 'latestMessage.sender',
    select: 'name pic email',
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    const chatData = {
      chatName: 'sender',
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        'users',
        '-password'
      );
      res.status(200).send(fullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  try {
    let results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 });

    results = await User.populate(results, {
      path: 'latestMessage.sender',
      select: 'name pic email',
    });

    const chatsWithUnreadCount = await Promise.all(
      results.map(async (chat) => {
        const unreadCount = await Message.countDocuments({
          chat: chat._id,
          readBy: { $ne: req.user._id },
          sender: { $ne: req.user._id },
        });

        return {
          ...chat.toObject(),
          unreadCount,
        };
      })
    );

    res.status(200).send(chatsWithUnreadCount);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: 'Please fill all the fields' });
  }

  let users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send('More than 2 users are required to form a group chat');
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName,
    },
    {
      new: true,
    }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

  if (!updatedChat) {
    res.status(404);
    throw new Error('Chat not found');
  } else {
    res.json(updatedChat);
  }
});

const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

  if (!added) {
    res.status(404);
    throw new Error('Chat not found');
  } else {
    res.json(added);
  }
});

const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

  if (!removed) {
    res.status(404);
    throw new Error('Chat not found');
  } else {
    res.json(removed);
  }
});

const addGroupAdmin = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const chat = await Chat.findById(chatId);

  if (!chat || !chat.isGroupChat) {
    res.status(404);
    throw new Error('Group chat not found');
  }

  if (!chat.groupAdmins) {
    chat.groupAdmins = [];
  }

  if (chat.groupAdmins.includes(userId)) {
    res.status(400);
    throw new Error('User is already an admin');
  }

  chat.groupAdmins.push(userId);
  await chat.save();

  const updatedChat = await Chat.findById(chatId)
    .populate('users', '-password')
    .populate('groupAdmin', '-password')
    .populate('groupAdmins', '-password');

  res.json(updatedChat);
});

const removeGroupAdmin = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const chat = await Chat.findById(chatId);

  if (!chat || !chat.isGroupChat) {
    res.status(404);
    throw new Error('Group chat not found');
  }

  chat.groupAdmins = chat.groupAdmins.filter(
    (id) => id.toString() !== userId
  );
  await chat.save();

  const updatedChat = await Chat.findById(chatId)
    .populate('users', '-password')
    .populate('groupAdmin', '-password')
    .populate('groupAdmins', '-password');

  res.json(updatedChat);
});

const pinChat = asyncHandler(async (req, res) => {
  const { chatId } = req.body;

  const chat = await Chat.findById(chatId);

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  const existingPin = chat.isPinned.find(
    (pin) => pin.user.toString() === req.user._id.toString()
  );

  if (existingPin) {
    res.status(400);
    throw new Error('Chat already pinned');
  }

  chat.isPinned.push({ user: req.user._id });
  await chat.save();

  res.json({ message: 'Chat pinned successfully' });
});

const unpinChat = asyncHandler(async (req, res) => {
  const { chatId } = req.body;

  const chat = await Chat.findById(chatId);

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  chat.isPinned = chat.isPinned.filter(
    (pin) => pin.user.toString() !== req.user._id.toString()
  );
  await chat.save();

  res.json({ message: 'Chat unpinned successfully' });
});

const archiveChat = asyncHandler(async (req, res) => {
  const { chatId } = req.body;

  const chat = await Chat.findById(chatId);

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  const existingArchive = chat.isArchived.find(
    (archive) => archive.user.toString() === req.user._id.toString()
  );

  if (existingArchive) {
    res.status(400);
    throw new Error('Chat already archived');
  }

  chat.isArchived.push({ user: req.user._id });
  await chat.save();

  res.json({ message: 'Chat archived successfully' });
});

const unarchiveChat = asyncHandler(async (req, res) => {
  const { chatId } = req.body;

  const chat = await Chat.findById(chatId);

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  chat.isArchived = chat.isArchived.filter(
    (archive) => archive.user.toString() !== req.user._id.toString()
  );
  await chat.save();

  res.json({ message: 'Chat unarchived successfully' });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  try {
    const unreadCount = await Message.countDocuments({
      chat: chatId,
      readBy: { $ne: req.user._id },
      sender: { $ne: req.user._id },
    });

    res.json({ chatId, unreadCount });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const muteChat = asyncHandler(async (req, res) => {
  const { chatId, duration } = req.body;

  const chat = await Chat.findById(chatId);

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  const existingMute = chat.isMuted.find(
    (mute) => mute.user.toString() === req.user._id.toString()
  );

  if (existingMute) {
    existingMute.mutedUntil = duration
      ? new Date(Date.now() + duration * 1000)
      : null;
  } else {
    chat.isMuted.push({
      user: req.user._id,
      mutedUntil: duration ? new Date(Date.now() + duration * 1000) : null,
    });
  }

  await chat.save();
  res.json({ message: 'Chat muted successfully' });
});

const unmuteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.body;

  const chat = await Chat.findById(chatId);

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  chat.isMuted = chat.isMuted.filter(
    (mute) => mute.user.toString() !== req.user._id.toString()
  );
  await chat.save();

  res.json({ message: 'Chat unmuted successfully' });
});

const setChatWallpaper = asyncHandler(async (req, res) => {
  const { chatId, wallpaperUrl } = req.body;

  const chat = await Chat.findById(chatId);

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  const existingWallpaper = chat.wallpaper.find(
    (w) => w.user.toString() === req.user._id.toString()
  );

  if (existingWallpaper) {
    existingWallpaper.wallpaperUrl = wallpaperUrl;
  } else {
    chat.wallpaper.push({
      user: req.user._id,
      wallpaperUrl,
    });
  }

  await chat.save();
  res.json({ message: 'Chat wallpaper updated successfully' });
});

const setDisappearingMessages = asyncHandler(async (req, res) => {
  const { chatId, enabled, duration } = req.body;

  const chat = await Chat.findById(chatId);

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  if (chat.isGroupChat) {
    const isAdmin =
      chat.groupAdmin.toString() === req.user._id.toString() ||
      chat.groupAdmins.some((admin) => admin.toString() === req.user._id.toString());

    if (!isAdmin) {
      res.status(403);
      throw new Error('Only admins can change disappearing messages settings');
    }
  }

  chat.disappearingMessages = {
    enabled,
    duration: enabled ? duration : 0,
  };

  await chat.save();
  res.json({
    message: 'Disappearing messages settings updated',
    disappearingMessages: chat.disappearingMessages,
  });
});

const exportChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  try {
    const chat = await Chat.findById(chatId).populate('users', 'name email');

    if (!chat) {
      res.status(404);
      throw new Error('Chat not found');
    }

    const isUserInChat = chat.users.some(
      (user) => user._id.toString() === req.user._id.toString()
    );

    if (!isUserInChat) {
      res.status(403);
      throw new Error('You are not a member of this chat');
    }

    const messages = await Message.find({
      chat: chatId,
      deletedFor: { $ne: req.user._id },
    })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    const exportData = {
      chatName: chat.chatName || 'Direct Chat',
      isGroupChat: chat.isGroupChat,
      exportedAt: new Date().toISOString(),
      exportedBy: req.user.name,
      messages: messages.map((msg) => ({
        sender: msg.sender.name,
        content: msg.content,
        messageType: msg.messageType,
        timestamp: msg.createdAt,
        isEdited: msg.isEdited,
        isDeleted: msg.isDeleted,
      })),
    };

    res.json(exportData);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  addGroupAdmin,
  removeGroupAdmin,
  pinChat,
  unpinChat,
  archiveChat,
  unarchiveChat,
  getUnreadCount,
  muteChat,
  unmuteChat,
  setChatWallpaper,
  setDisappearingMessages,
  exportChat,
};
