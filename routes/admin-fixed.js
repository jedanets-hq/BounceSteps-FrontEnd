const express = require('express');
const router = express.Router();

// Admin routes - placeholder
router.get('/stats', async (req, res) => {
  res.json({ success: true, data: { users: 0, providers: 0, bookings: 0 } });
});

module.exports = router;
