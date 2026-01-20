const express = require('express');
const router = express.Router();

// Traveler stories routes - placeholder
router.get('/', async (req, res) => {
  res.json({ success: true, data: [] });
});

router.post('/', async (req, res) => {
  res.json({ success: true, message: 'Story created' });
});

module.exports = router;
