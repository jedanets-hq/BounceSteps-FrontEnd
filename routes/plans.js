const express = require('express');
const router = express.Router();
const { pool } = require('../models');
const passport = require('passport');

// Get all plans for authenticated user
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if plans table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'plans'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      const result = await pool.query(`
        SELECT 
          p.*,
          COUNT(DISTINCT ps.service_id) as services_count
        FROM plans p
        LEFT JOIN plan_services ps ON p.id = ps.plan_id
        WHERE p.user_id = $1
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `, [userId]);
      
      // Parse JSON fields if they exist
      const plans = result.rows.map(plan => ({
        ...plan,
        services: plan.services ? (typeof plan.services === 'string' ? JSON.parse(plan.services) : plan.services) : [],
        destinations: plan.destinations ? (typeof plan.destinations === 'string' ? JSON.parse(plan.destinations) : plan.destinations) : [],
        plan_data: plan.plan_data ? (typeof plan.plan_data === 'string' ? JSON.parse(plan.plan_data) : plan.plan_data) : {}
      }));
      
      res.json({ success: true, plans, count: plans.length });
    } else {
      // Table doesn't exist yet - return empty array
      res.json({ success: true, plans: [], count: 0 });
    }
  } catch (error) {
    console.error('Get plans error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get plans',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get plans for a user (by userId param)
router.get('/user/:userId', async (req, res) => {
  try {
    // Check if plans table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'plans'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      const result = await pool.query(`
        SELECT * FROM plans
        WHERE user_id = $1
        ORDER BY created_at DESC
      `, [req.params.userId]);
      
      res.json({ success: true, data: result.rows });
    } else {
      res.json({ success: true, data: [] });
    }
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ success: false, message: 'Failed to get plans' });
  }
});

// Create new plan
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, destinations, start_date, end_date, budget, plan_data } = req.body;
    
    // Check if plans table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'plans'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      // Create plans table if it doesn't exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS plans (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          destinations TEXT[],
          start_date DATE,
          end_date DATE,
          budget DECIMAL(10, 2),
          plan_data JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }
    
    const result = await pool.query(`
      INSERT INTO plans (user_id, title, description, destinations, start_date, end_date, budget, plan_data)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [userId, title, description, destinations, start_date, end_date, budget, JSON.stringify(plan_data)]);
    
    res.status(201).json({ success: true, plan: result.rows[0] });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ success: false, message: 'Failed to create plan' });
  }
});

module.exports = router;
