const mongoose = require('mongoose');

const chatSchema = mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    groupAdmins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    groupIcon: {
      type: String,
    },
    groupDescription: {
      type: String,
    },
    isPinned: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        pinnedAt: { type: Date, default: Date.now },
      },
    ],
    isArchived: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        archivedAt: { type: Date, default: Date.now },
      },
    ],
    isMuted: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        mutedUntil: { type: Date },
      },
    ],
    wallpaper: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        wallpaperUrl: { type: String },
      },
    ],
    disappearingMessages: {
      enabled: { type: Boolean, default: false },
      duration: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
