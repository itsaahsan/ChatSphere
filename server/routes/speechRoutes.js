const express = require('express');
const multer = require('multer');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');
const { speechToText, textToSpeechConvert } = require('../utils/speechService');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Speech-to-Text
router.post(
  '/speech-to-text',
  protect,
  upload.single('audio'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Audio file is required' });
    }

    const text = await speechToText(req.file.buffer);
    res.json({ text, success: true });
  })
);

// Text-to-Speech
router.post(
  '/text-to-speech',
  protect,
  asyncHandler(async (req, res) => {
    const { text, languageCode } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const audioContent = await textToSpeechConvert(text, languageCode || 'en-US');
    res.set('Content-Type', 'audio/mpeg');
    res.send(audioContent);
  })
);

module.exports = router;
