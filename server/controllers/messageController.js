const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const User = require('../models/User');
const Chat = require('../models/Chat');
const { encryptMessage, decryptMessage } = require('../utils/encryption');
const { sendPushNotification, createNotification } = require('./notificationController');

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId, messageType, fileUrl, fileName, fileSize, replyTo } =
    req.body;

  if (!chatId) {
    res.status(400);
    throw new Error('Invalid data passed into request');
  }

  if (!content && !fileUrl) {
    res.status(400);
    throw new Error('Message content or file is required');
  }

  let encryptedContent = '';
  if (content && messageType === 'text') {
    try {
      encryptedContent = encryptMessage(content);
    } catch (error) {
      console.error('Encryption error:', error);
      encryptedContent = content;
    }
  }

  const newMessage = {
    sender: req.user._id,
    content: encryptedContent || content || '',
    chat: chatId,
    messageType: messageType || 'text',
    fileUrl,
    fileName,
    fileSize,
    replyTo,
    readBy: [{ user: req.user._id, readAt: new Date() }],
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate('sender', 'name pic');
    message = await message.populate('chat');
    message = await message.populate({
      path: 'replyTo',
      populate: {
        path: 'sender',
        select: 'name pic email',
      },
    });
    message = await User.populate(message, {
      path: 'chat.users',
      select: 'name pic email',
    });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    const chat = await Chat.findById(chatId).populate('users', '_id name');
    if (chat && chat.users) {
      chat.users.forEach((user) => {
        if (user._id.toString() !== req.user._id.toString()) {
          sendPushNotification(user._id, {
            title: `New message from ${req.user.name}`,
            body: content || 'Sent an attachment',
            icon: req.user.pic,
            data: {
              chatId: chatId,
              messageId: message._id,
            },
          });

          createNotification(user._id, 'message', {
            sender: req.user._id,
            chat: chatId,
            message: message._id,
            content: content || 'Sent an attachment',
          });
        }
      });
    }

    const messageToSend = message.toObject();
    if (messageToSend.content && messageType === 'text') {
      try {
        messageToSend.content = decryptMessage(messageToSend.content);
      } catch (error) {
        console.error('Decryption error:', error);
      }
    }

    res.json(messageToSend);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(400);
    throw new Error(error.message);
  }
});

const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({
      chat: req.params.chatId,
      deletedFor: { $ne: req.user._id },
    })
      .populate('sender', 'name pic email')
      .populate('chat')
      .populate({
        path: 'replyTo',
        populate: {
          path: 'sender',
          select: 'name pic email',
        },
      });

    const decryptedMessages = messages.map((msg) => {
      const message = msg.toObject();
      if (message.content && message.messageType === 'text' && !message.isDeleted) {
        try {
          message.content = decryptMessage(message.content);
        } catch (error) {
          console.error('Error decrypting message:', error);
        }
      }
      return message;
    });

    res.json(decryptedMessages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const markMessageAsRead = asyncHandler(async (req, res) => {
  const { messageId } = req.body;

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      res.status(404);
      throw new Error('Message not found');
    }

    if (!message.readBy.includes(req.user._id)) {
      message.readBy.push(req.user._id);
      await message.save();
    }

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const addReaction = asyncHandler(async (req, res) => {
  const { messageId, emoji } = req.body;

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      res.status(404);
      throw new Error('Message not found');
    }

    // Check if user already reacted
    const existingReaction = message.reactions.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingReaction) {
      // Update existing reaction
      existingReaction.emoji = emoji;
    } else {
      // Add new reaction
      message.reactions.push({ user: req.user._id, emoji });
    }

    await message.save();
    await message.populate('reactions.user', 'name pic');
    await message.populate('sender', 'name pic email');
    await message.populate({
      path: 'replyTo',
      populate: {
        path: 'sender',
        select: 'name pic email',
      },
    });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const removeReaction = asyncHandler(async (req, res) => {
  const { messageId } = req.body;

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      res.status(404);
      throw new Error('Message not found');
    }

    message.reactions = message.reactions.filter(
      (r) => r.user.toString() !== req.user._id.toString()
    );

    await message.save();
    await message.populate('reactions.user', 'name pic');
    await message.populate('sender', 'name pic email');
    await message.populate({
      path: 'replyTo',
      populate: {
        path: 'sender',
        select: 'name pic email',
      },
    });
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      res.status(404);
      throw new Error('Message not found');
    }

    // Only sender can delete
    if (message.sender.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this message');
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = 'This message was deleted';

    await message.save();
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const editMessage = asyncHandler(async (req, res) => {
  const { messageId, content } = req.body;

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      res.status(404);
      throw new Error('Message not found');
    }

    // Only sender can edit
    if (message.sender.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to edit this message');
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();

    await message.save();

    const encryptedContent = encryptMessage(content);
    message.content = encryptedContent;
    await message.save();

    const messageToSend = message.toObject();
    messageToSend.content = content;

    res.json(messageToSend);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const searchMessages = asyncHandler(async (req, res) => {
  const { chatId, query } = req.query;

  try {
    const messages = await Message.find({
      chat: chatId,
      content: { $regex: query, $options: 'i' },
      isDeleted: false,
    })
      .populate('sender', 'name pic')
      .populate({
        path: 'replyTo',
        populate: {
          path: 'sender',
          select: 'name pic email',
        },
      })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const forwardMessage = asyncHandler(async (req, res) => {
  const { messageId, chatIds } = req.body;

  if (!messageId || !chatIds || chatIds.length === 0) {
    res.status(400);
    throw new Error('Message ID and chat IDs are required');
  }

  try {
    const originalMessage = await Message.findById(messageId);

    if (!originalMessage) {
      res.status(404);
      throw new Error('Message not found');
    }

    const forwardedMessages = [];

    for (const chatId of chatIds) {
      const newMessage = {
        sender: req.user._id,
        content: originalMessage.content,
        chat: chatId,
        messageType: originalMessage.messageType,
        fileUrl: originalMessage.fileUrl,
        fileName: originalMessage.fileName,
        fileSize: originalMessage.fileSize,
        forwardedFrom: originalMessage._id,
        readBy: [req.user._id],
      };

      let message = await Message.create(newMessage);
      message = await message.populate('sender', 'name pic');
      message = await message.populate('chat');
      message = await User.populate(message, {
        path: 'chat.users',
        select: 'name pic email',
      });

      await Chat.findByIdAndUpdate(chatId, {
        latestMessage: message,
      });

      forwardedMessages.push(message);
    }

    res.json(forwardedMessages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const markMessageAsDelivered = asyncHandler(async (req, res) => {
  const { messageId } = req.body;

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      res.status(404);
      throw new Error('Message not found');
    }

    const existingDelivery = message.deliveredTo.find(
      (delivery) => delivery.user.toString() === req.user._id.toString()
    );

    if (!existingDelivery) {
      message.deliveredTo.push({ user: req.user._id });
      await message.save();
    }

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const deleteMessageForMe = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      res.status(404);
      throw new Error('Message not found');
    }

    if (!message.deletedFor.includes(req.user._id)) {
      message.deletedFor.push(req.user._id);
      await message.save();
    }

    res.json({ message: 'Message deleted for you' });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const getMessageInfo = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await Message.findById(messageId)
      .populate('sender', 'name pic email')
      .populate('readBy.user', 'name pic email')
      .populate('deliveredTo.user', 'name pic email');

    if (!message) {
      res.status(404);
      throw new Error('Message not found');
    }

    res.json({
      _id: message._id,
      sender: message.sender,
      createdAt: message.createdAt,
      deliveredTo: message.deliveredTo,
      readBy: message.readBy,
      isEdited: message.isEdited,
      editedAt: message.editedAt,
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  sendMessage,
  allMessages,
  markMessageAsRead,
  addReaction,
  removeReaction,
  deleteMessage,
  editMessage,
  searchMessages,
  forwardMessage,
  markMessageAsDelivered,
  deleteMessageForMe,
  getMessageInfo,
};
