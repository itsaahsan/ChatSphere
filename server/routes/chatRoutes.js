const express = require('express');
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  addGroupAdmin,
  removeGroupAdmin,
  pinChat,
  unpinChat,
  archiveChat,
  unarchiveChat,
  getUnreadCount,
  muteChat,
  unmuteChat,
  setChatWallpaper,
  setDisappearingMessages,
  exportChat,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, accessChat);
router.route('/').get(protect, fetchChats);
router.route('/group').post(protect, createGroupChat);
router.route('/rename').put(protect, renameGroup);
router.route('/groupadd').put(protect, addToGroup);
router.route('/groupremove').put(protect, removeFromGroup);
router.route('/groupadmin/add').put(protect, addGroupAdmin);
router.route('/groupadmin/remove').put(protect, removeGroupAdmin);
router.route('/pin').put(protect, pinChat);
router.route('/unpin').put(protect, unpinChat);
router.route('/archive').put(protect, archiveChat);
router.route('/unarchive').put(protect, unarchiveChat);
router.route('/unread/:chatId').get(protect, getUnreadCount);
router.route('/mute').put(protect, muteChat);
router.route('/unmute').put(protect, unmuteChat);
router.route('/wallpaper').put(protect, setChatWallpaper);
router.route('/disappearing').put(protect, setDisappearingMessages);
router.route('/export/:chatId').get(protect, exportChat);

module.exports = router;
