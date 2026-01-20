const express = require('express');
const router = express.Router();

// Notification routes - placeholder
router.get('/user/:userId', async (req, res) => {
  res.json({ success: true, data: [] });
});

router.post('/', async (req, res) => {
  res.json({ success: true, message: 'Notification sent' });
});

module.exports = router;
