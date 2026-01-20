const express = require('express');
const router = express.Router();

// Plans routes - placeholder
router.get('/user/:userId', async (req, res) => {
  res.json({ success: true, data: [] });
});

router.post('/', async (req, res) => {
  res.json({ success: true, message: 'Plan created' });
});

module.exports = router;
