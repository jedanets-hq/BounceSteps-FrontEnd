const express = require('express');
const { pool } = require('../config/postgresql');
const { authenticateJWT } = require('../middleware/jwtAuth');

const router = express.Router();

// Create a new multi-trip journey
router.post('/create', authenticateJWT, async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;
    const { 
      journeyName, 
      destinations, 
      startDate, 
      endDate, 
      travelers, 
      budget 
    } = req.body;

    if (!destinations || destinations.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least 2 destinations are required for multi-trip'
      });
    }

    if (destinations.length > 4) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 4 destinations allowed'
      });
    }

    await client.query('BEGIN');

    // Create the journey
    const journeyResult = await client.query(`
      INSERT INTO multi_trip_journeys 
        (user_id, journey_name, total_destinations, start_date, end_date, travelers, budget, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft')
      RETURNING *
    `, [userId, journeyName, destinations.length, startDate, endDate, travelers, budget]);

    const journey = journeyResult.rows[0];

    // Insert destinations
    const destinationPromises = destinations.map((dest, index) => {
      return client.query(`
        INSERT INTO multi_trip_destinations 
          (journey_id, destination_order, country, region, district, sublocation, is_starting_point, is_ending_point)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        journey.id,
        index + 1,
        dest.country,
        dest.region,
        dest.district,
        dest.sublocation,
        index === 0,
        index === destinations.length - 1
      ]);
    });

    const destinationResults = await Promise.all(destinationPromises);
    const insertedDestinations = destinationResults.map(r => r.rows[0]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Multi-trip journey created',
      journey: {
        ...journey,
        destinations: insertedDestinations
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating multi-trip journey:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating multi-trip journey'
    });
  } finally {
    client.release();
  }
});

// Get user's multi-trip journeys
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    const journeys = await pool.query(`
      SELECT * FROM multi_trip_journeys 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `, [userId]);

    // Get destinations for each journey
    const journeysWithDestinations = await Promise.all(
      journeys.rows.map(async (journey) => {
        const destinations = await pool.query(`
          SELECT * FROM multi_trip_destinations 
          WHERE journey_id = $1 
          ORDER BY destination_order
        `, [journey.id]);

        const services = await pool.query(`
          SELECT mts.*, s.title, s.description, s.price, s.category, s.images,
                 sp.business_name as provider_name
          FROM multi_trip_services mts
          JOIN services s ON mts.service_id = s.id
          JOIN service_providers sp ON s.provider_id = sp.id
          WHERE mts.journey_id = $1
        `, [journey.id]);

        return {
          ...journey,
          destinations: destinations.rows,
          services: services.rows
        };
      })
    );

    res.json({
      success: true,
      journeys: journeysWithDestinations
    });
  } catch (error) {
    console.error('❌ Error fetching multi-trip journeys:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching journeys'
    });
  }
});

// Get single journey details
router.get('/:journeyId', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { journeyId } = req.params;

    const journey = await pool.query(`
      SELECT * FROM multi_trip_journeys 
      WHERE id = $1 AND user_id = $2
    `, [journeyId, userId]);

    if (journey.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found'
      });
    }

    const destinations = await pool.query(`
      SELECT * FROM multi_trip_destinations 
      WHERE journey_id = $1 
      ORDER BY destination_order
    `, [journeyId]);

    const services = await pool.query(`
      SELECT mts.*, s.title, s.description, s.price, s.category, s.images,
             sp.business_name as provider_name, mtd.sublocation as destination_name
      FROM multi_trip_services mts
      JOIN services s ON mts.service_id = s.id
      JOIN service_providers sp ON s.provider_id = sp.id
      LEFT JOIN multi_trip_destinations mtd ON mts.destination_id = mtd.id
      WHERE mts.journey_id = $1
    `, [journeyId]);

    res.json({
      success: true,
      journey: {
        ...journey.rows[0],
        destinations: destinations.rows,
        services: services.rows
      }
    });
  } catch (error) {
    console.error('❌ Error fetching journey:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching journey'
    });
  }
});

// Add service to multi-trip journey
router.post('/:journeyId/services', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { journeyId } = req.params;
    const { serviceId, destinationId, price } = req.body;

    // Verify journey belongs to user
    const journey = await pool.query(
      'SELECT id FROM multi_trip_journeys WHERE id = $1 AND user_id = $2',
      [journeyId, userId]
    );

    if (journey.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found'
      });
    }

    // Add service
    const result = await pool.query(`
      INSERT INTO multi_trip_services (journey_id, destination_id, service_id, price)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (journey_id, destination_id, service_id) 
      DO UPDATE SET price = $4
      RETURNING *
    `, [journeyId, destinationId, serviceId, price]);

    // Update total cost
    await pool.query(`
      UPDATE multi_trip_journeys 
      SET total_cost = (
        SELECT COALESCE(SUM(price), 0) FROM multi_trip_services WHERE journey_id = $1
      )
      WHERE id = $1
    `, [journeyId]);

    res.json({
      success: true,
      message: 'Service added to journey',
      service: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error adding service:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding service'
    });
  }
});

// Remove service from journey
router.delete('/:journeyId/services/:serviceId', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { journeyId, serviceId } = req.params;

    // Verify journey belongs to user
    const journey = await pool.query(
      'SELECT id FROM multi_trip_journeys WHERE id = $1 AND user_id = $2',
      [journeyId, userId]
    );

    if (journey.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found'
      });
    }

    await pool.query(
      'DELETE FROM multi_trip_services WHERE journey_id = $1 AND service_id = $2',
      [journeyId, serviceId]
    );

    // Update total cost
    await pool.query(`
      UPDATE multi_trip_journeys 
      SET total_cost = (
        SELECT COALESCE(SUM(price), 0) FROM multi_trip_services WHERE journey_id = $1
      )
      WHERE id = $1
    `, [journeyId]);

    res.json({
      success: true,
      message: 'Service removed from journey'
    });
  } catch (error) {
    console.error('❌ Error removing service:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing service'
    });
  }
});

// Update journey status
router.put('/:journeyId/status', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { journeyId } = req.params;
    const { status } = req.body;

    const validStatuses = ['draft', 'saved', 'pending_payment', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const result = await pool.query(`
      UPDATE multi_trip_journeys 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `, [status, journeyId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found'
      });
    }

    res.json({
      success: true,
      message: 'Journey status updated',
      journey: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status'
    });
  }
});

// Delete journey
router.delete('/:journeyId', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { journeyId } = req.params;

    const result = await pool.query(
      'DELETE FROM multi_trip_journeys WHERE id = $1 AND user_id = $2 RETURNING id',
      [journeyId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found'
      });
    }

    res.json({
      success: true,
      message: 'Journey deleted'
    });
  } catch (error) {
    console.error('❌ Error deleting journey:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting journey'
    });
  }
});

module.exports = router;
