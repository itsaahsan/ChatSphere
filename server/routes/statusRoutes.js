const express = require('express');
const {
  createStatus,
  getStatuses,
  viewStatus,
  deleteStatus,
  getMyStatuses,
} = require('../controllers/statusController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, createStatus).get(protect, getStatuses);
router.route('/my').get(protect, getMyStatuses);
router.route('/:statusId').get(protect, viewStatus).delete(protect, deleteStatus);

module.exports = router;
