const mongoose = require('mongoose');

const broadcastSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

const Broadcast = mongoose.model('Broadcast', broadcastSchema);

module.exports = Broadcast;
