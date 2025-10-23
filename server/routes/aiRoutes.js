const express = require('express');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');
const { generateAIReply, generateSummary, generateSmartReplies } = require('../utils/aiService');

const router = express.Router();

// Generate AI reply
router.post(
  '/reply',
  protect,
  asyncHandler(async (req, res) => {
    const { messageContent, conversationContext } = req.body;

    if (!messageContent) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const reply = await generateAIReply(messageContent, conversationContext || []);
    res.json({ reply });
  })
);

// Generate summary from messages
router.post(
  '/summary',
  protect,
  asyncHandler(async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'Messages array is required' });
    }

    const summary = await generateSummary(messages);
    res.json({ summary });
  })
);

// Get smart reply suggestions
router.post(
  '/smart-replies',
  protect,
  asyncHandler(async (req, res) => {
    const { lastMessage } = req.body;

    if (!lastMessage) {
      return res.status(400).json({ message: 'Last message is required' });
    }

    const replies = await generateSmartReplies(lastMessage);
    res.json({ replies });
  })
);

module.exports = router;
