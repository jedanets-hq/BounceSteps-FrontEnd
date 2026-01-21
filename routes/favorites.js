const express = require('express');
const router = express.Router();
const { pool } = require('../models');
const passport = require('passport');

// Get all favorites for authenticated user
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(`
      SELECT f.*, 
             s.title, 
             s.description, 
             s.price, 
             s.category,
             s.images,
             s.region,
             s.district,
             s.area,
             s.location,
             s.average_rating,
             s.review_count,
             sp.business_name as provider_name,
             sp.user_id as provider_id
      FROM favorites f
      LEFT JOIN services s ON f.service_id = s.id
      LEFT JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
    `, [userId]);
    
    res.json({ success: true, favorites: result.rows });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ success: false, message: 'Failed to get favorites' });
  }
});

// Add service to favorites
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceId } = req.body;
    
    if (!serviceId) {
      return res.status(400).json({ success: false, message: 'Service ID is required' });
    }
    
    // Check if service exists
    const serviceCheck = await pool.query('SELECT id FROM services WHERE id = $1', [serviceId]);
    if (serviceCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    
    // Add to favorites (or ignore if already exists)
    const result = await pool.query(`
      INSERT INTO favorites (user_id, service_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, service_id) DO NOTHING
      RETURNING *
    `, [userId, serviceId]);
    
    if (result.rows.length > 0) {
      res.json({ success: true, message: 'Added to favorites', favorite: result.rows[0] });
    } else {
      res.json({ success: true, message: 'Already in favorites' });
    }
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({ success: false, message: 'Failed to add to favorites' });
  }
});

// Remove from favorites
router.delete('/:serviceId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id;
    const serviceId = req.params.serviceId;
    
    const result = await pool.query(`
      DELETE FROM favorites
      WHERE user_id = $1 AND service_id = $2
      RETURNING *
    `, [userId, serviceId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }
    
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove from favorites' });
  }
});

// Check if service is favorited
router.get('/check/:serviceId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id;
    const serviceId = req.params.serviceId;
    
    const result = await pool.query(`
      SELECT id FROM favorites
      WHERE user_id = $1 AND service_id = $2
    `, [userId, serviceId]);
    
    res.json({ success: true, isFavorite: result.rows.length > 0 });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ success: false, message: 'Failed to check favorite' });
  }
});

module.exports = router;
