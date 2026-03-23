const express = require('express');
const router = express.Router();
const { pool } = require('../models');
const passport = require('passport');

// Get user profile (authenticated)
router.get('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('📋 Fetching profile for user:', userId);
    
    // Get user data
    const userResult = await pool.query(`
      SELECT id, email, first_name, last_name, phone, avatar_url, user_type, is_verified, created_at
      FROM users
      WHERE id = $1
    `, [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // If user is a service provider, get their provider profile
    if (user.user_type === 'service_provider') {
      const providerResult = await pool.query(`
        SELECT * FROM service_providers
        WHERE user_id = $1
      `, [userId]);
      
      if (providerResult.rows.length > 0) {
        user.provider = providerResult.rows[0];
        console.log('✅ Provider profile included:', {
          business_name: user.provider.business_name,
          service_categories: user.provider.service_categories
        });
      }
    }
    
    console.log('✅ Profile fetched successfully');
    res.json({ success: true, user });
  } catch (error) {
    console.error('❌ Get user profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to get user profile', error: error.message });
  }
});

// Update user profile (authenticated)
router.put('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, phone, avatar_url } = req.body;
    
    console.log('📝 Updating user profile for user:', userId);
    console.log('📦 Update data received:', { first_name, last_name, phone, avatar_url });
    
    // Validate required fields
    if (!first_name || !last_name) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'First name and last name are required' 
      });
    }
    
    // Validate first_name and last_name are strings
    if (typeof first_name !== 'string' || typeof last_name !== 'string') {
      console.log('❌ Validation failed: Invalid data types');
      return res.status(400).json({ 
        success: false, 
        message: 'First name and last name must be text' 
      });
    }
    
    console.log('✅ Validation passed, updating database...');
    
    const result = await pool.query(`
      UPDATE users
      SET first_name = $1,
          last_name = $2,
          phone = COALESCE($3, phone),
          avatar_url = COALESCE($4, avatar_url),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, email, first_name, last_name, phone, avatar_url, user_type, is_verified
    `, [first_name, last_name, phone, avatar_url, userId]);
    
    if (result.rows.length === 0) {
      console.log('❌ User not found in database');
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    console.log('✅ User profile updated successfully:', result.rows[0]);
    
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('❌ Update user profile error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user profile',
      error: error.message 
    });
  }
});

// Update business profile (for service providers)
router.put('/business-profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      business_name, 
      business_type, 
      service_location, 
      service_categories, 
      location_data, 
      description 
    } = req.body;
    
    console.log('📝 Updating business profile for user:', userId);
    console.log('📦 Business data received:', { 
      business_name, 
      business_type, 
      service_location, 
      service_categories, 
      location_data, 
      description 
    });
    
    // Check if provider profile exists
    const checkResult = await pool.query(
      'SELECT * FROM service_providers WHERE user_id = $1',
      [userId]
    );
    
    if (checkResult.rows.length === 0) {
      console.log('📝 Creating new provider profile...');
      // Create new provider profile
      const result = await pool.query(`
        INSERT INTO service_providers (
          user_id, business_name, business_type, service_location, 
          service_categories, location_data, description, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `, [
        userId, 
        business_name, 
        business_type, 
        service_location, 
        JSON.stringify(service_categories || []), 
        JSON.stringify(location_data || {}), 
        description
      ]);
      
      console.log('✅ Business profile created successfully');
      return res.json({ success: true, provider: result.rows[0] });
    } else {
      console.log('📝 Updating existing provider profile...');
      // Up