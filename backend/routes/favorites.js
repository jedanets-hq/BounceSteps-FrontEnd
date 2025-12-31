const express = require('express');
const { pool } = require('../config/postgresql');
const { authenticateJWT } = require('../middleware/jwtAuth');

const router = express.Router();

// Test endpoint - no auth required
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Favorites API is working',
    timestamp: new Date().toISOString()
  });
});

// Get user's favorite providers
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        f.id,
        f.user_id,
        f.provider_id,
        f.added_at,
        sp.business_name,
        sp.business_type,
        sp.description,
        sp.location,
        sp.rating,
        sp.total_bookings,
        sp.is_verified,
        u.first_name,
        u.last_name,
        u.avatar_url
      FROM favorites f
      JOIN service_providers sp ON f.provider_id = sp.id
      JOIN users u ON sp.user_id = u.id
      WHERE f.user_id = $1
      ORDER BY f.added_at DESC
    `;

    const result = await pool.query(query, [userId]);
    
    res.json({
      success: true,
      favorites: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching favorites'
    });
  }
});

// Check if provider is favorited
router.get('/check/:providerId', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { providerId } = req.params;

    const query = `
      SELECT id FROM favorites 
      WHERE user_id = $1 AND provider_id = $2
    `;

    const result = await pool.query(query, [userId, providerId]);
    
    res.json({
      success: true,
      isFavorite: result.rows.length > 0
    });
  } catch (error) {
    console.error('❌ Error checking favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking favorite'
    });
  }
});

// Add provider to favorites
router.post('/add', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { providerId } = req.body;

    if (!providerId) {
      return res.status(400).json({
        success: false,
        message: 'Provider ID is required'
      });
    }

    // Check if provider exists
    const providerCheck = await pool.query(
      'SELECT id FROM service_providers WHERE id = $1',
      [providerId]
    );

    if (providerCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Insert favorite
    const query = `
      INSERT INTO favorites (user_id, provider_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, provider_id) DO NOTHING
      RETURNING *
    `;

    const result = await pool.query(query, [userId, providerId]);

    res.json({
      success: true,
      message: 'Provider added to favorites',
      favorite: result.rows[0] || { user_id: userId, provider_id: providerId }
    });
  } catch (error) {
    console.error('❌ Error adding to favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to favorites'
    });
  }
});

// Remove provider from favorites
router.delete('/:providerId', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { providerId } = req.params;

    const query = `
      DELETE FROM favorites 
      WHERE user_id = $1 AND provider_id = $2
      RETURNING id
    `;

    const result = await pool.query(query, [userId, providerId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    res.json({
      success: true,
      message: 'Provider removed from favorites'
    });
  } catch (error) {
    console.error('❌ Error removing from favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from favorites'
    });
  }
});

// Clear all favorites
router.delete('/', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    const query = 'DELETE FROM favorites WHERE user_id = $1';
    await pool.query(query, [userId]);

    res.json({
      success: true,
      message: 'All favorites cleared'
    });
  } catch (error) {
    console.error('❌ Error clearing favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing favorites'
    });
  }
});

module.exports = router;
