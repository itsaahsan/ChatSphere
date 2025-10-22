const asyncHandler = require('express-async-handler');
const Status = require('../models/Status');
const User = require('../models/User');

const createStatus = asyncHandler(async (req, res) => {
  const { content, mediaType, mediaUrl, backgroundColor } = req.body;

  if (!content && !mediaUrl) {
    res.status(400);
    throw new Error('Status content or media is required');
  }

  try {
    const status = await Status.create({
      user: req.user._id,
      content: content || '',
      mediaType: mediaType || 'text',
      mediaUrl,
      backgroundColor: backgroundColor || '#075E54',
    });

    await status.populate('user', 'name pic');
    res.json(status);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const getStatuses = asyncHandler(async (req, res) => {
  try {
    const statuses = await Status.find({
      expiresAt: { $gt: new Date() },
    })
      .populate('user', 'name pic')
      .populate('viewers.user', 'name pic')
      .sort({ createdAt: -1 });

    res.json(statuses);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const viewStatus = asyncHandler(async (req, res) => {
  const { statusId } = req.params;

  try {
    const status = await Status.findById(statusId);

    if (!status) {
      res.status(404);
      throw new Error('Status not found');
    }

    // Check if already viewed
    const alreadyViewed = status.viewers.some(
      (v) => v.user.toString() === req.user._id.toString()
    );

    if (!alreadyViewed) {
      status.viewers.push({ user: req.user._id });
      await status.save();
    }

    await status.populate('user', 'name pic');
    await status.populate('viewers.user', 'name pic');

    res.json(status);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const deleteStatus = asyncHandler(async (req, res) => {
  const { statusId } = req.params;

  try {
    const status = await Status.findById(statusId);

    if (!status) {
      res.status(404);
      throw new Error('Status not found');
    }

    if (status.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this status');
    }

    await status.deleteOne();
    res.json({ message: 'Status deleted successfully' });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const getMyStatuses = asyncHandler(async (req, res) => {
  try {
    const statuses = await Status.find({
      user: req.user._id,
      expiresAt: { $gt: new Date() },
    })
      .populate('viewers.user', 'name pic')
      .sort({ createdAt: -1 });

    res.json(statuses);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  createStatus,
  getStatuses,
  viewStatus,
  deleteStatus,
  getMyStatuses,
};
