const express = require('express');
const {
  getVapidPublicKey,
  subscribe,
  unsubscribe,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/vapid-public-key', getVapidPublicKey);
router.post('/subscribe', protect, subscribe);
router.post('/unsubscribe', protect, unsubscribe);
router.get('/', protect, getNotifications);
router.put('/read/:notificationId', protect, markNotificationAsRead);
router.put('/read-all', protect, markAllNotificationsAsRead);
router.delete('/:notificationId', protect, deleteNotification);

module.exports = router;
