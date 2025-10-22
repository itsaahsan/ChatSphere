const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      message: 'File uploaded successfully',
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });
  });
});

module.exports = router;
