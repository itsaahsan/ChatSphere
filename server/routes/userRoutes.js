const express = require('express');
const {
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
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, searchUsers);
router.route('/register').post(registerUser);
router.route('/login').post(authUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.route('/block').post(protect, blockUser);
router.route('/unblock').post(protect, unblockUser);
router.route('/blocked').get(protect, getBlockedUsers);
router.route('/send-otp').post(sendOTP);
router.route('/verify-otp').post(verifyOTP);
router.route('/send-verification').post(sendVerificationEmail);
router.route('/verify/:token').get(verifyEmail);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(resetPassword);
router.route('/contacts').get(protect, getContacts).post(protect, addContact);
router.route('/contacts/remove').post(protect, removeContact);
router.route('/starred').get(protect, getStarredMessages);
router.route('/starred/add').post(protect, starMessage);
router.route('/starred/remove').post(protect, unstarMessage);

module.exports = router;
