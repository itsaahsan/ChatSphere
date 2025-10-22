const asyncHandler = require('express-async-handler');
const Broadcast = require('../models/Broadcast');
const Message = require('../models/Message');
const User = require('../models/User');
const { sendPushNotification, createNotification } = require('./notificationController');
const { encryptMessage } = require('../utils/encryption');

const createBroadcast = asyncHandler(async (req, res) => {
  const { name, recipients, description } = req.body;

  if (!name || !recipients || recipients.length === 0) {
    res.status(400);
    throw new Error('Please provide broadcast name and recipients');
  }

  try {
    const broadcast = await Broadcast.create({
      name,
      creator: req.user._id,
      recipients,
      description,
    });

    const populatedBroadcast = await Broadcast.findById(broadcast._id)
      .populate('creator', 'name pic email')
      .populate('recipients', 'name pic email');

    res.status(201).json(populatedBroadcast);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const getBroadcasts = asyncHandler(async (req, res) => {
  try {
    const broadcasts = await Broadcast.find({ creator: req.user._id })
      .populate('creator', 'name pic email')
      .populate('recipients', 'name pic email')
      .sort({ createdAt: -1 });

    res.json(broadcasts);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const updateBroadcast = asyncHandler(async (req, res) => {
  const { broadcastId, name, recipients, description } = req.body;

  try {
    const broadcast = await Broadcast.findById(broadcastId);

    if (!broadcast) {
      res.status(404);
      throw new Error('Broadcast not found');
    }

    if (broadcast.creator.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this broadcast');
    }

    if (name) broadcast.name = name;
    if (recipients) broadcast.recipients = recipients;
    if (description !== undefined) broadcast.description = description;

    await broadcast.save();

    const updatedBroadcast = await Broadcast.findById(broadcastId)
      .populate('creator', 'name pic email')
      .populate('recipients', 'name pic email');

    res.json(updatedBroadcast);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const deleteBroadcast = asyncHandler(async (req, res) => {
  const { broadcastId } = req.params;

  try {
    const broadcast = await Broadcast.findById(broadcastId);

    if (!broadcast) {
      res.status(404);
      throw new Error('Broadcast not found');
    }

    if (broadcast.creator.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this broadcast');
    }

    await broadcast.deleteOne();
    res.json({ message: 'Broadcast deleted successfully' });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const sendBroadcastMessage = asyncHandler(async (req, res) => {
  const { broadcastId, content, messageType, fileUrl, fileName, fileSize } = req.body;

  try {
    const broadcast = await Broadcast.findById(broadcastId).populate('recipients');

    if (!broadcast) {
      res.status(404);
      throw new Error('Broadcast not found');
    }

    if (broadcast.creator.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to send messages to this broadcast');
    }

    const encryptedContent = content ? encryptMessage(content) : '';

    const sentMessages = [];

    for (const recipient of broadcast.recipients) {
      sendPushNotification(recipient._id, {
        title: `Broadcast from ${req.user.name}`,
        body: content || 'Sent an attachment',
        icon: req.user.pic,
        data: {
          type: 'broadcast',
          broadcastId: broadcast._id,
        },
      });

      createNotification(recipient._id, 'message', {
        sender: req.user._id,
        content: `Broadcast: ${content || 'Attachment'}`,
      });
    }

    res.json({
      message: 'Broadcast message sent successfully',
      recipientCount: broadcast.recipients.length,
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  createBroadcast,
  getBroadcasts,
  updateBroadcast,
  deleteBroadcast,
  sendBroadcastMessage,
};
