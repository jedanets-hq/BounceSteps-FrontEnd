const express = require('express');
const passport = require('passport');
const { pool } = require('../config/postgresql');

const router = express.Router();
const authenticateJWT = passport.authenticate('jwt', { session: false });

// Get user's trip plans
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        tp.id,
        tp.user_id,
        tp.service_id,
        tp.plan_date,
        tp.notes,
        tp.added_at,
        s.title,
        s.description,
        s.price,
        s.category,
        s.location,
        s.images,
        sp.business_name as provider_name,
        sp.id as provider_id
      FROM trip_plans tp
      JOIN services s ON tp.service_id = s.id
      JOIN service_providers sp ON s.provider_id = sp.id
      WHERE tp.user_id = $1
      ORDER BY tp.plan_date ASC, tp.added_at DESC
    `;

    const result = await pool.query(query, [userId]);
    
    res.json({
      success: true,
      plans: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ Error fetching trip plans:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trip plans'
    });
  }
});

// Add service to trip plan
router.post('/add', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceId, planDate, notes } = req.body;

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

    // Insert trip plan
    const query = `
      INSERT INTO trip_plans (user_id, service_id, plan_date, notes)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, service_id) 
      DO UPDATE SET plan_date = $3, notes = $4, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await pool.query(query, [userId, serviceId, planDate, notes]);

    res.json({
      success: true,
      message: 'Service added to trip plan',
      plan: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error adding to trip plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to trip plan'
    });
  }
});

// Update trip plan
router.put('/:planId', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { planId } = req.params;
    const { planDate, notes } = req.body;

    const query = `
      UPDATE trip_plans 
      SET plan_date = $1, notes = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND user_id = $4
      RETURNING *
    `;

    const result = await pool.query(query, [planDate, notes, planId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Trip plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Trip plan updated',
      plan: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error updating trip plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating trip plan'
    });
  }
});

// Remove service from trip plan
router.delete('/:planId', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { planId } = req.params;

    const query = `
      DELETE FROM trip_plans 
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;

    const result = await pool.query(query, [planId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Trip plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Service removed from trip plan'
    });
  } catch (error) {
    console.error('❌ Error removing from trip plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from trip plan'
    });
  }
});

// Clear all trip plans
router.delete('/', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    const query = 'DELETE FROM trip_plans WHERE user_id = $1';
    await pool.query(query, [userId]);

    res.json({
      success: true,
      message: 'All trip plans cleared'
    });
  } catch (error) {
    console.error('❌ Error clearing trip plans:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing trip plans'
    });
  }
});

module.exports = router;