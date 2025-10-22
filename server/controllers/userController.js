const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const {
  generateOTP,
  generateVerificationToken,
  isOTPExpired,
  getOTPExpiryTime,
  getVerificationTokenExpiry,
} = require('../utils/otpService');

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please enter all fields');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      about: user.about,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Failed to create user');
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      about: user.about,
      isOnline: user.isOnline,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.about = req.body.about || user.about;
    user.pic = req.body.pic || user.pic;
    user.status = req.body.status || user.status;
    user.theme = req.body.theme || user.theme;

    if (req.body.notifications) {
      user.notifications = {
        ...user.notifications,
        ...req.body.notifications,
      };
    }

    if (req.body.privacy) {
      user.privacy = {
        ...user.privacy,
        ...req.body.privacy,
      };
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      pic: updatedUser.pic,
      about: updatedUser.about,
      status: updatedUser.status,
      theme: updatedUser.theme,
      notifications: updatedUser.notifications,
      privacy: updatedUser.privacy,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const blockUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!user.blockedUsers.includes(userId)) {
    user.blockedUsers.push(userId);
    await user.save();
  }

  res.json({ message: 'User blocked successfully' });
});

const unblockUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.blockedUsers = user.blockedUsers.filter(
    (id) => id.toString() !== userId
  );
  await user.save();

  res.json({ message: 'User unblocked successfully' });
});

const getBlockedUsers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    'blockedUsers',
    'name pic email'
  );

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json(user.blockedUsers);
});

const sendOTP = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    res.status(400);
    throw new Error('Please provide a phone number');
  }

  let user = await User.findOne({ phone });

  if (!user) {
    user = await User.create({
      phone,
      name: 'User',
    });
  }

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpiry = getOTPExpiryTime();
  await user.save();

  res.json({ message: 'OTP sent successfully', phone });
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    res.status(400);
    throw new Error('Please provide phone number and OTP');
  }

  const user = await User.findOne({ phone });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!user.otp || isOTPExpired(user.otpExpiry)) {
    res.status(400);
    throw new Error('OTP expired');
  }

  if (user.otp !== otp) {
    res.status(400);
    throw new Error('Invalid OTP');
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    pic: user.pic,
    about: user.about,
    isVerified: user.isVerified,
    token: generateToken(user._id),
  });
});

const sendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide an email');
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error('User already verified');
  }

  const verificationToken = generateVerificationToken();
  user.verificationToken = verificationToken;
  user.verificationTokenExpiry = getVerificationTokenExpiry();
  await user.save();

  res.json({ message: 'Verification email sent', email });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({ verificationToken: token });

  if (!user) {
    res.status(400);
    throw new Error('Invalid verification token');
  }

  if (new Date() > user.verificationTokenExpiry) {
    res.status(400);
    throw new Error('Verification token expired');
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiry = undefined;
  await user.save();

  res.json({ message: 'Email verified successfully' });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide an email');
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User not found with this email');
  }

  const resetToken = generateVerificationToken();
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpiry = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  res.json({
    message: 'Password reset token generated',
    resetToken,
    expiresIn: '15 minutes',
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400);
    throw new Error('Please provide token and new password');
  }

  const user = await User.findOne({ resetPasswordToken: token });

  if (!user) {
    res.status(400);
    throw new Error('Invalid reset token');
  }

  if (new Date() > user.resetPasswordExpiry) {
    res.status(400);
    throw new Error('Reset token has expired');
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save();

  res.json({ message: 'Password reset successful' });
});

const addContact = asyncHandler(async (req, res) => {
  const { contactId } = req.body;

  if (!contactId) {
    res.status(400);
    throw new Error('Please provide contact ID');
  }

  const user = await User.findById(req.user._id);
  const contact = await User.findById(contactId);

  if (!contact) {
    res.status(404);
    throw new Error('Contact not found');
  }

  if (user.contacts.includes(contactId)) {
    res.status(400);
    throw new Error('Contact already added');
  }

  user.contacts.push(contactId);
  await user.save();

  res.json({ message: 'Contact added successfully' });
});

const removeContact = asyncHandler(async (req, res) => {
  const { contactId } = req.body;

  if (!contactId) {
    res.status(400);
    throw new Error('Please provide contact ID');
  }

  const user = await User.findById(req.user._id);

  user.contacts = user.contacts.filter((id) => id.toString() !== contactId);
  await user.save();

  res.json({ message: 'Contact removed successfully' });
});

const getContacts = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    'contacts',
    'name pic email phone isOnline lastSeen status'
  );

  res.json(user.contacts);
});

const starMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.body;

  if (!messageId) {
    res.status(400);
    throw new Error('Please provide message ID');
  }

  const user = await User.findById(req.user._id);

  if (user.starredMessages.includes(messageId)) {
    res.status(400);
    throw new Error('Message already starred');
  }

  user.starredMessages.push(messageId);
  await user.save();

  res.json({ message: 'Message starred successfully' });
});

const unstarMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.body;

  if (!messageId) {
    res.status(400);
    throw new Error('Please provide message ID');
  }

  const user = await User.findById(req.user._id);

  user.starredMessages = user.starredMessages.filter(
    (id) => id.toString() !== messageId
  );
  await user.save();

  res.json({ message: 'Message unstarred successfully' });
});

const getStarredMessages = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'starredMessages',
    populate: {
      path: 'sender chat',
      select: 'name pic chatName',
    },
  });

  res.json(user.starredMessages);
});

const searchUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
        ],
      }
    : {};

  const users = await User.find(keyword)
    .find({ _id: { $ne: req.user._id } })
    .select('-password');
  
  res.json(users);
});

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  searchUsers,
  blockUser,
  unblockUser,
  getBlockedUsers,
  sendOTP,
  verifyOTP,
  sendVerificationEmail,
  verifyEmail,
  forgotPassword,
  resetPassword,
  addContact,
  removeContact,
  getContacts,
  starMessage,
  unstarMessage,
  getStarredMessages,
};
