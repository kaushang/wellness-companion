const express = require('express');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Handle chat messages (placeholder - just logs for now)
router.post('/message', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // For now, just print the message to console
    console.log(`[Chat Message from ${req.user.email}]:`, message);

    res.json({ 
      message: 'Message received', 
      echo: `Message received successfully` 
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;



