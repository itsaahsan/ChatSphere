const asyncHandler = require('express-async-handler');
const Call = require('../models/Call');

const createCall = asyncHandler(async (req, res) => {
  const { receiver, callType } = req.body;

  if (!receiver || !callType) {
    res.status(400);
    throw new Error('Receiver and call type are required');
  }

  try {
    const call = await Call.create({
      caller: req.user._id,
      receiver,
      callType,
      status: 'missed',
    });

    await call.populate('caller', 'name pic');
    await call.populate('receiver', 'name pic');

    res.json(call);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const updateCallStatus = asyncHandler(async (req, res) => {
  const { callId, status, duration, startedAt, endedAt } = req.body;

  try {
    const call = await Call.findById(callId);

    if (!call) {
      res.status(404);
      throw new Error('Call not found');
    }

    call.status = status;
    if (duration !== undefined) call.duration = duration;
    if (startedAt) call.startedAt = startedAt;
    if (endedAt) call.endedAt = endedAt;

    await call.save();
    await call.populate('caller', 'name pic');
    await call.populate('receiver', 'name pic');

    res.json(call);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const getCallHistory = asyncHandler(async (req, res) => {
  try {
    const calls = await Call.find({
      $or: [{ caller: req.user._id }, { receiver: req.user._id }],
    })
      .populate('caller', 'name pic')
      .populate('receiver', 'name pic')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(calls);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const deleteCall = asyncHandler(async (req, res) => {
  const { callId } = req.params;

  try {
    const call = await Call.findById(callId);

    if (!call) {
      res.status(404);
      throw new Error('Call not found');
    }

    await call.deleteOne();
    res.json({ message: 'Call deleted successfully' });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  createCall,
  updateCallStatus,
  getCallHistory,
  deleteCall,
};
