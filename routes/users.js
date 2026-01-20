const express = require('express');
const router = express.Router();
const { User } = require('../models');

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Remove password from response
    delete user.password;
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Failed to get user' });
  }
});

// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Don't allow password updates through this endpoint
    
    const user = await User.update(req.params.id, updates);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    delete user.password;
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

module.exports = router;
