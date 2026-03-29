const express = require('express');
const router = express.Router();
const { pool } = require('../models/pg');
const { authenticateJWT } = require('../middleware/jwtAuth');

// Get all conversations for a user
router.get('/conversations', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;

    let query;
    if (userType === 'traveler') {
      query = `
        SELECT DISTINCT ON (m.provider_id, m.service_id)
          m.provider_id,
          m.service_id,
          s.title as service_title,
          u.first_name || ' ' || u.last_name as provider_name,
          sp.business_name,
          m.message_text as last_message,
          m.created_at as last_message_time,
          m.sender_type as last_sender,
          COUNT(CASE WHEN NOT m.is_read AND m.sender_type = 'provider' THEN 1 END) OVER (PARTITION BY m.provider_id, m.service_id) as unread_count
        FROM messages m
        LEFT JOIN services s ON m.service_id = s.id
        LEFT JOIN users u ON m.provider_id = u.id
        LEFT JOIN service_providers sp ON m.provider_id = sp.user_id
        WHERE m.traveller_id = $1
        ORDER BY m.provider_id, m.service_id, m.created_at DESC
      `;
    } else {
      query = `
        SELECT DISTINCT ON (m.traveller_id, m.service_id)
          m.traveller_id,
          m.service_id,
          s.title as service_title,
          u.first_name || ' ' || u.last_name as traveller_name,
          m.message_text as last_message,
          m.created_at as last_message_time,
          m.sender_type as last_sender,
          COUNT(CASE WHEN NOT m.is_read AND m.sender_type = 'traveller' THEN 1 END) OVER (PARTITION BY m.traveller_id, m.service_id) as unread_count
        FROM messages m
        LEFT JOIN services s ON m.service_id = s.id
        LEFT JOIN users u ON m.traveller_id = u.id
        WHERE m.provider_id = $1
        ORDER BY m.traveller_id, m.service_id, m.created_at DESC
      `;
    }

    const result = await pool.query(query, [userId]);

    res.json({
      success: true,
      conversations: result.rows
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
});

// Get messages for a specific conversation
router.get('/conversation/:otherUserId/:serviceId?', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;
    const otherUserId = parseInt(req.params.otherUserId);
    const serviceId = req.params.serviceId ? parseInt(req.params.serviceId) : null;

    let query;
    let params;

    if (serviceId) {
      if (userType === 'traveler') {
        query = `
          SELECT 
            m.*,
            u.first_name || ' ' || u.last_name as sender_name
          FROM messages m
          LEFT JOIN users u ON 
            (m.sender_type = 'traveller' AND m.traveller_id = u.id) OR
            (m.sender_type = 'provider' AND m.provider_id = u.id)
          WHERE m.traveller_id = $1 
            AND m.provider_id = $2 
            AND m.service_id = $3
          ORDER BY m.created_at ASC
        `;
        params = [userId, otherUserId, serviceId];
      } else {
        query = `
          SELECT 
            m.*,
            u.first_name || ' ' || u.last_name as sender_name
          FROM messages m
          LEFT JOIN users u ON 
            (m.sender_type = 'traveller' AND m.traveller_id = u.id) OR
            (m.sender_type = 'provider' AND m.provider_id = u.id)
          WHERE m.provider_id = $1 
            AND m.traveller_id = $2 
            AND m.service_id = $3
          ORDER BY m.created_at ASC
        `;
        params = [userId, otherUserId, serviceId];
      }
    } else {
      if (userType === 'traveler') {
        query = `
          SELECT 
            m.*,
            u.first_name || ' ' || u.last_name as sender_name
          FROM messages m
          LEFT JOIN users u ON 
            (m.sender_type = 'traveller' AND m.traveller_id = u.id) OR
            (m.sender_type = 'provider' AND m.provider_id = u.id)
          WHERE m.traveller_id = $1 
            AND m.provider_id = $2
          ORDER BY m.created_at ASC
        `;
        params = [userId, otherUserId];
      } else {
        query = `
          SELECT 
            m.*,
            u.first_name || ' ' || u.last_name as sender_name
          FROM messages m
          LEFT JOIN users u ON 
            (m.sender_type = 'traveller' AND m.traveller_id = u.id) OR
            (m.sender_type = 'provider' AND m.provider_id = u.id)
          WHERE m.provider_id = $1 
            AND m.traveller_id = $2
          ORDER BY m.created_at ASC
        `;
        params = [userId, otherUserId];
      }
    }

    const result = await pool.query(query, params);

    // Mark messages as read
    if (userType === 'traveler') {
      await pool.query(
        `UPDATE messages 
         SET is_read = TRUE 
         WHERE traveller_id = $1 
           AND provider_id = $2 
           AND sender_type = 'provider'
           AND is_read = FALSE
           ${serviceId ? 'AND service_id = $3' : ''}`,
        serviceId ? [userId, otherUserId, serviceId] : [userId, otherUserId]
      );
    } else {
      await pool.query(
        `UPDATE messages 
         SET is_read = TRUE 
         WHERE provider_id = $1 
           AND traveller_id = $2 
           AND sender_type = 'traveller'
           AND is_read = FALSE
           ${serviceId ? 'AND service_id = $3' : ''}`,
        serviceId ? [userId, otherUserId, serviceId] : [userId, otherUserId]
      );
    }

    res.json({
      success: true,
      messages: result.rows
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// Send a message
router.post('/send', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;
    const { otherUserId, serviceId, messageText } = req.body;

    if (!otherUserId || !messageText) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    let query;
    let params;

    if (userType === 'traveler') {
      query = `
        INSERT INTO messages (traveller_id, provider_id, service_id, sender_type, message_text)
        VALUES ($1, $2, $3, 'traveller', $4)
        RETURNING *
      `;
      params = [userId, otherUserId, serviceId || null, messageText];
    } else {
      query = `
        INSERT INTO messages (traveller_id, provider_id, service_id, sender_type, message_text)
        VALUES ($1, $2, $3, 'provider', $4)
        RETURNING *
      `;
      params = [otherUserId, userId, serviceId || null, messageText];
    }

    const result = await pool.query(query, params);

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// Get unread message count
router.get('/unread-count', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;

    let query;
    if (userType === 'traveler') {
      query = `
        SELECT COUNT(*) as count
        FROM messages
        WHERE traveller_id = $1 
          AND sender_type = 'provider'
          AND is_read = FALSE
      `;
    } else {
      query = `
        SELECT COUNT(*) as count
        FROM messages
        WHERE provider_id = $1 
          AND sender_type = 'traveller'
          AND is_read = FALSE
      `;
    }

    const result = await pool.query(query, [userId]);

    res.json({
      success: true,
      count: parseInt(result.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count'
    });
  }
});

module.exports = router;
