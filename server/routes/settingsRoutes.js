const express = require('express');
const {
  getSettings,
  updateTheme,
  updateNotificationSettings,
  updatePrivacySettings,
  updateAllSettings,
  resetSettings,
} = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getSettings);
router.put('/theme', protect, updateTheme);
router.put('/notifications', protect, updateNotificationSettings);
router.put('/privacy', protect, updatePrivacySettings);
router.put('/', protect, updateAllSettings);
router.post('/reset', protect, resetSettings);

module.exports = router;
