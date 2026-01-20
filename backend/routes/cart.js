const express = require('express');
const router = express.Router();

// Cart routes - placeholder (client-side managed)
router.get('/user/:userId', async (req, res) => {
  res.json({ success: true, data: [] });
});

router.post('/', async (req, res) => {
  res.json({ success: true, message: 'Cart managed on client side' });
});

module.exports = router;
