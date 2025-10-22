const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: { type: String, trim: true },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: { type: Date, default: Date.now },
      },
    ],
    deliveredTo: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        deliveredAt: { type: Date, default: Date.now },
      },
    ],
    forwardedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'document', 'audio', 'video', 'voice'],
      default: 'text',
    },
    fileUrl: { type: String },
    fileName: { type: String },
    fileSize: { type: Number },
    duration: { type: Number },
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        emoji: { type: String },
      },
    ],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
    isStarred: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    disappearAfter: { type: Number },
    disappearAt: { type: Date },
  },
  { timestamps: true }
);

messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ disappearAt: 1 }, { expireAfterSeconds: 0 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
