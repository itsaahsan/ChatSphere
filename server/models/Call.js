const mongoose = require('mongoose');

const callSchema = mongoose.Schema(
  {
    caller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    callType: {
      type: String,
      enum: ['voice', 'video'],
      required: true,
    },
    status: {
      type: String,
      enum: ['missed', 'rejected', 'completed', 'cancelled'],
      required: true,
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    startedAt: {
      type: Date,
    },
    endedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Call = mongoose.model('Call', callSchema);

module.exports = Call;
