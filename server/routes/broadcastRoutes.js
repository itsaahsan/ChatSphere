const express = require('express');
const {
  createBroadcast,
  getBroadcasts,
  updateBroadcast,
  deleteBroadcast,
  sendBroadcastMessage,
} = require('../controllers/broadcastController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, createBroadcast).get(protect, getBroadcasts);
router.route('/:broadcastId').put(protect, updateBroadcast).delete(protect, deleteBroadcast);
router.route('/send').post(protect, sendBroadcastMessage);

module.exports = router;
