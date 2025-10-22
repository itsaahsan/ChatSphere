const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpiry: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpiry: { type: Date },
    otp: { type: String },
    otpExpiry: { type: Date },
    pic: {
      type: String,
      default:
        'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
    },
    about: {
      type: String,
      default: 'Hey there! I am using ChatSphere.',
    },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['Available', 'Busy', 'Away', 'Do Not Disturb'],
      default: 'Available',
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light',
    },
    notifications: {
      sound: { type: Boolean, default: true },
      desktop: { type: Boolean, default: true },
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    privacy: {
      lastSeen: {
        type: String,
        enum: ['everyone', 'contacts', 'nobody'],
        default: 'everyone',
      },
      profilePic: {
        type: String,
        enum: ['everyone', 'contacts', 'nobody'],
        default: 'everyone',
      },
      about: {
        type: String,
        enum: ['everyone', 'contacts', 'nobody'],
        default: 'everyone',
      },
    },
    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    starredMessages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
      },
    ],
    pushSubscription: {
      endpoint: { type: String },
      keys: {
        p256dh: { type: String },
        auth: { type: String },
      },
    },
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
