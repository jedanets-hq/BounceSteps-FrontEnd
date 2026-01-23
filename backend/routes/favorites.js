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
    // Accept both serviceId and providerId for backwards compatibility
    const { serviceId, providerId } = req.body;
    const targetId = serviceId || providerId;
    
    if (!targetId) {
      return res.status(400).json({ success: false, message: 'Service ID or Provider ID is required' });
    }
    
    // Check if it's a service ID or provider ID
    let finalServiceId = targetId;
    
    // If it looks like a provider ID, find their services
    const serviceCheck = await pool.query('SELECT id FROM services WHERE id = $1', [targetId]);
    if (serviceCheck.rows.length === 0) {
      // Try as provider ID - get their first service
      const providerServiceCheck = await pool.query('SELECT id FROM services WHERE provider_id = $1 LIMIT 1', [targetId]);
      if (providerServiceCheck.rows.length > 0) {
        finalServiceId = providerServiceCheck.rows[0].id;
      } else {
        return res.status(404).json({ success: false, message: 'Service or Provider not found' });
      }
    }
    
    // Add to favorites (or ignore if already exists)
    const result = await pool.query(`
      INSERT INTO favorites (user_id, service_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, service_id) DO NOTHING
      RETURNING *
    `, [userId, finalServiceId]);
    
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
    const targetId = req.params.serviceId;
    
    // Try to delete by service ID first
    let result = await pool.query(`
      DELETE FROM favorites
      WHERE user_id = $1 AND service_id = $2
      RETURNING *
    `, [userId, targetId]);
    
    // If not found, try as provider ID - delete all services from that provider
    if (result.rows.length === 0) {
      result = await pool.query(`
        DELETE FROM favorites
        WHERE user_id = $1 AND service_id IN (
          SELECT id FROM services WHERE provider_id = $2
        )
        RETURNING *
      `, [userId, targetId]);
    }
    
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
    const targetId = req.params.serviceId;
    
    // Check by service ID first
    let result = await pool.query(`
      SELECT id FROM favorites
      WHERE user_id = $1 AND service_id = $2
    `, [userId, targetId]);
    
    // If not found, check by provider ID
    if (result.rows.length === 0) {
      result = await pool.query(`
        SELECT id FROM favorites
        WHERE user_id = $1 AND service_id IN (
          SELECT id FROM services WHERE provider_id = $2
        )
      `, [userId, targetId]);
    }
    
    res.json({ success: true, isFavorite: result.rows.length > 0 });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ success: false, message: 'Failed to check favorite' });
  }
});

module.exports = router;
