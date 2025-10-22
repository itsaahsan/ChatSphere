const express = require('express');
const {
  sendMessage,
  allMessages,
  markMessageAsRead,
  addReaction,
  removeReaction,
  deleteMessage,
  editMessage,
  searchMessages,
  forwardMessage,
  markMessageAsDelivered,
  deleteMessageForMe,
  getMessageInfo,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, sendMessage);
router.route('/:chatId').get(protect, allMessages);
router.route('/read').put(protect, markMessageAsRead);
router.route('/delivered').put(protect, markMessageAsDelivered);
router.route('/reaction').post(protect, addReaction);
router.route('/reaction').delete(protect, removeReaction);
router.route('/delete/:messageId').delete(protect, deleteMessage);
router.route('/delete-for-me/:messageId').delete(protect, deleteMessageForMe);
router.route('/edit').put(protect, editMessage);
router.route('/search').get(protect, searchMessages);
router.route('/forward').post(protect, forwardMessage);
router.route('/info/:messageId').get(protect, getMessageInfo);

module.exports = router;
