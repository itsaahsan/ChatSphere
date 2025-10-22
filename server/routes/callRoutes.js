const express = require('express');
const {
  createCall,
  updateCallStatus,
  getCallHistory,
  deleteCall,
} = require('../controllers/callController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, createCall);
router.route('/update').put(protect, updateCallStatus);
router.route('/history').get(protect, getCallHistory);
router.route('/:callId').delete(protect, deleteCall);

module.exports = router;
