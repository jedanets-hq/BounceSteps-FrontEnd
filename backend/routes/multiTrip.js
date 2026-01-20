const express = require('express');
const router = express.Router();

// Multi-trip routes - placeholder
router.get('/', async (req, res) => {
  res.json({ success: true, data: [] });
});

router.post('/', async (req, res) => {
  res.json({ success: true, message: 'Multi-trip created' });
});

module.exports = router;
