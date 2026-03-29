const express = require('express');
const router = express.Router();
const { pool } = require('../models');
const { authenticateJWT } = require('../middleware/jwtAuth');

// Get reviews for a service
router.get('/service/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    
    const result = await pool.query(`
      SELECT 
        r.*,
        u.first_name,
        u.last_name,
        u.avatar_url
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.service_id = $1
      ORDER BY r.created_at DESC
    `, [serviceId]);
    
    res.json({
      success: true,
      reviews: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// Get reviews by a user
router.get('/user/my-reviews', authenticateJWT, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.*,
        s.title as service_title,
        s.images as service_images,
        sp.business_name as provider_name
      FROM reviews r
      JOIN services s ON r.service_id = s.id
      JOIN service_providers sp ON s.provider_id = sp.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `, [req.user.id]);
    
    res.json({
      success: true,
      reviews: result.rows
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// Submit a review
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { serviceId, bookingId, rating, reviewText } = req.body;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
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
    
    // Check if user has already reviewed this service (for this booking if provided)
    let existingReview;
    if (bookingId) {
      existingReview = await pool.query(
        'SELECT id FROM reviews WHERE service_id = $1 AND user_id = $2 AND booking_id = $3',
        [serviceId, req.user.id, bookingId]
      );
    } else {
      existingReview = await pool.query(
        'SELECT id FROM reviews WHERE service_id = $1 AND user_id = $2 AND booking_id IS NULL',
        [serviceId, req.user.id]
      );
    }
    
    if (existingReview.rows.length > 0) {
      // Update existing review
      const result = await pool.query(`
        UPDATE reviews
        SET rating = $1, review_text = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `, [rating, reviewText || null, existingReview.rows[0].id]);
      
      return res.json({
        success: true,
        message: 'Review updated successfully',
        review: result.rows[0]
      });
    }
    
    // Insert new review
    const result = await pool.query(`
      INSERT INTO reviews (service_id, user_id, booking_id, rating, review_text)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [serviceId, req.user.id, bookingId || null, rating, reviewText || null]);
    
    // Update booking rating if bookingId provided
    if (bookingId) {
      await pool.query(
        'UPDATE bookings SET rating = $1 WHERE id = $2',
        [rating, bookingId]
      );
    }
    
    res.json({
      success: true,
      message: 'Review submitted successfully',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update a review
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, reviewText } = req.body;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    // Check if review belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM reviews WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you do not have permission to edit it'
      });
    }
    
    // Update review
    const result = await pool.query(`
      UPDATE reviews
      SET rating = $1, review_text = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [rating, reviewText || null, id]);
    
    // Update booking rating if exists
    if (checkResult.rows[0].booking_id) {
      await pool.query(
        'UPDATE bookings SET rating = $1 WHERE id = $2',
        [rating, checkResult.rows[0].booking_id]
      );
    }
    
    res.json({
      success: true,
      message: 'Review updated successfully',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review'
    });
  }
});

// Delete a review
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if review belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM reviews WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you do not have permission to delete it'
      });
    }
    
    // Delete review
    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
    
    // Clear booking rating if exists
    if (checkResult.rows[0].booking_id) {
      await pool.query(
        'UPDATE bookings SET rating = NULL WHERE id = $1',
        [checkResult.rows[0].booking_id]
      );
    }
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
});

// Get service rating summary
router.get('/service/:serviceId/summary', async (req, res) => {
  try {
    const { serviceId } = req.params;
    
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM reviews
      WHERE service_id = $1
    `, [serviceId]);
    
    res.json({
      success: true,
      summary: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching rating summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rating summary'
    });
  }
});

module.exports = router;
