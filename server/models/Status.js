const mongoose = require('mongoose');

const statusSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ['text', 'image', 'video'],
      default: 'text',
    },
    mediaUrl: {
      type: String,
    },
    backgroundColor: {
      type: String,
      default: '#075E54',
    },
    viewers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  },
  { timestamps: true }
);

// Auto-delete expired statuses
statusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Status = mongoose.model('Status', statusSchema);

module.exports = Status;
