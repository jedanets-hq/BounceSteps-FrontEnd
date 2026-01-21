const express = require('express');
const router = express.Router();
const { pool } = require('../models');
const passport = require('passport');

// Get all reviews for a service
router.get('/service/:serviceId', async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    
    const result = await pool.query(`
      SELECT r.*, 
             u.first_name, 
             u.last_name, 
             u.avatar_url
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.service_id = $1
      ORDER BY r.created_at DESC
    `, [serviceId]);
    
    res.json({ success: true, reviews: result.rows });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: 'Failed to get reviews' });
  }
});

// Get all reviews for a provider
router.get('/provider/:providerId', async (req, res) => {
  try {
    const providerId = req.params.providerId;
    
    const result = await pool.query(`
      SELECT r.*, 
             u.first_name, 
             u.last_name, 
             u.avatar_url,
             s.title as service_title
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN services s ON r.service_id = s.id
      WHERE r.provider_id = $1
      ORDER BY r.created_at DESC
    `, [providerId]);
    
    res.json({ success: true, reviews: result.rows });
  } catch (error) {
    console.error('Get provider reviews error:', error);
    res.status(500).json({ success: false, message: 'Failed to get reviews' });
  }
});

// Create review
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.id;
    const { serviceId, providerId, bookingId, rating, comment } = req.body;
    
    console.log('📝 Creating review:', { userId, serviceId, rating });
    
    if (!serviceId || !rating) {
      return res.status(400).json({ 
        success: false, 
        message: 'Service ID and rating are required' 
      });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }
    
    await client.query('BEGIN');
    
    // Insert review
    const result = await client.query(`
      INSERT INTO reviews (user_id, service_id, provider_id, booking_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, service_id) 
      DO UPDATE SET rating = $5, comment = $6, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [userId, serviceId, providerId, bookingId, rating, comment]);
    
    // Update service average rating and review count
    await client.query(`
      UPDATE services
      SET 
        average_rating = (
          SELECT AVG(rating)::DECIMAL(3,2) 
          FROM reviews 
          WHERE service_id = $1
        ),
        review_count = (
          SELECT COUNT(*) 
          FROM reviews 
          WHERE service_id = $1
        ),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [serviceId]);
    
    // Update provider rating
    if (providerId) {
      await client.query(`
        UPDATE service_providers
        SET 
          rating = (
            SELECT AVG(rating)::DECIMAL(3,2) 
            FROM reviews 
            WHERE provider_id = $1
          ),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `, [providerId]);
    }
    
    await client.query('COMMIT');
    
    console.log('✅ Review created successfully');
    
    res.status(201).json({ 
      success: true, 
      message: 'Review submitted successfully',
      review: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Create review error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
});

// Update review
router.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.id;
    const reviewId = req.params.id;
    const { rating, comment } = req.body;
    
    await client.query('BEGIN');
    
    // Update review
    const result = await client.query(`
      UPDATE reviews
      SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND user_id = $4
      RETURNING *
    `, [rating, comment, reviewId, userId]);
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    const review = result.rows[0];
    
    // Update service average rating
    await client.query(`
      UPDATE services
      SET 
        average_rating = (
          SELECT AVG(rating)::DECIMAL(3,2) 
          FROM reviews 
          WHERE service_id = $1
        ),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [review.service_id]);
    
    // Update provider rating
    if (review.provider_id) {
      await client.query(`
        UPDATE service_providers
        SET 
          rating = (
            SELECT AVG(rating)::DECIMAL(3,2) 
            FROM reviews 
            WHERE provider_id = $1
          ),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `, [review.provider_id]);
    }
    
    await client.query('COMMIT');
    
    res.json({ success: true, review: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update review error:', error);
    res.status(500).json({ success: false, message: 'Failed to update review' });
  } finally {
    client.release();
  }
});

// Delete review
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.id;
    const reviewId = req.params.id;
    
    await client.query('BEGIN');
    
    // Get review details before deleting
    const reviewResult = await client.query(`
      SELECT service_id, provider_id FROM reviews
      WHERE id = $1 AND user_id = $2
    `, [reviewId, userId]);
    
    if (reviewResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    const { service_id, provider_id } = reviewResult.rows[0];
    
    // Delete review
    await client.query(`
      DELETE FROM reviews
      WHERE id = $1 AND user_id = $2
    `, [reviewId, userId]);
    
    // Update service average rating and review count
    await client.query(`
      UPDATE services
      SET 
        average_rating = COALESCE((
          SELECT AVG(rating)::DECIMAL(3,2) 
          FROM reviews 
          WHERE service_id = $1
        ), 0.00),
        review_count = (
          SELECT COUNT(*) 
          FROM reviews 
          WHERE service_id = $1
        ),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [service_id]);
    
    // Update provider rating
    if (provider_id) {
      await client.query(`
        UPDATE service_providers
        SET 
          rating = COALESCE((
            SELECT AVG(rating)::DECIMAL(3,2) 
            FROM reviews 
            WHERE provider_id = $1
          ), 0.00),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `, [provider_id]);
    }
    
    await client.query('COMMIT');
    
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete review' });
  } finally {
    client.release();
  }
});

// Get user's reviews
router.get('/user/my-reviews', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(`
      SELECT r.*, 
             s.title as service_title,
             s.images as service_images,
             sp.business_name as provider_name
      FROM reviews r
      LEFT JOIN services s ON r.service_id = s.id
      LEFT JOIN service_providers sp ON r.provider_id = sp.user_id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `, [userId]);
    
    res.json({ success: true, reviews: result.rows });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ success: false, message: 'Failed to get reviews' });
  }
});

module.exports = router;
