const express = require('express');
const router = express.Router();

// Favorites routes - placeholder (client-side managed)
router.get('/user/:userId', async (req, res) => {
  res.json({ success: true, data: [] });
});

router.post('/', async (req, res) => {
  res.json({ success: true, message: 'Favorites managed on client side' });
});

module.exports = router;
