const express = require('express');
const passport = require('passport');
const { pool } = require('../config/postgresql');

const router = express.Router();

// Custom JWT authentication with better error handling
const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      console.error('❌ [Cart Routes] JWT authentication error:', err);
      return res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
    }
    
    if (!user) {
      console.warn('⚠️  [Cart Routes] Authentication failed:', info?.message || 'No user');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }
    
    req.user = user;
    next();
  })(req, res, next);
};

// Log when cart routes are loaded
console.log('📦 [Cart Routes] Module loaded successfully');

// Test endpoint to verify routes are working (no auth required)
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Cart routes are working',
    timestamp: new Date().toISOString()
  });
});

// Get user's cart
router.get('/', authenticateJWT, async (req, res) => {
  try {
    console.log('📥 [Cart Routes] GET / - User:', req.user?.id);
    const userId = req.user.id;

    const query = `
      SELECT 
        ci.id,
        ci.user_id,
        ci.service_id,
        ci.quantity,
        ci.added_at,
        s.title,
        s.description,
        s.price,
        s.category,
        s.location,
        s.images,
        sp.business_name as provider_name,
        sp.id as provider_id
      FROM cart_items ci
      JOIN services s ON ci.service_id = s.id
      JOIN service_providers sp ON s.provider_id = sp.id
      WHERE ci.user_id = $1
      ORDER BY ci.added_at DESC
    `;

    const result = await pool.query(query, [userId]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('❌ Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart'
    });
  }
});

// Add item to cart
router.post('/add', authenticateJWT, async (req, res) => {
  try {
    console.log('📥 [Cart Routes] POST /add - User:', req.user?.id, 'Body:', req.body);
    const userId = req.user.id;
    const { serviceId, quantity = 1 } = req.body;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: 'Service ID is required'
      });
    }

    // Check if service exists
    const serviceCheck = await pool.query(
      'SELECT id FROM services WHERE id = $1',
      [serviceId]
    );

    if (serviceCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Insert or update cart item
    const query = `
      INSERT INTO cart_items (user_id, service_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, service_id) 
      DO UPDATE SET quantity = cart_items.quantity + $3, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await pool.query(query, [userId, serviceId, quantity]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Item added to cart'
    });
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to cart'
    });
  }
});

// Update cart item quantity
router.put('/:cartItemId', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const query = `
      UPDATE cart_items 
      SET quantity = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `;

    const result = await pool.query(query, [quantity, cartItemId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Cart item updated'
    });
  } catch (error) {
    console.error('❌ Error updating cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating cart item'
    });
  }
});

// Remove item from cart
router.delete('/:cartItemId', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.params;

    const query = `
      DELETE FROM cart_items 
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;

    const result = await pool.query(query, [cartItemId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('❌ Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from cart'
    });
  }
});

// Clear entire cart
router.delete('/', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    const query = 'DELETE FROM cart_items WHERE user_id = $1';
    await pool.query(query, [userId]);

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    console.error('❌ Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cart'
    });
  }
});

module.exports = router;
