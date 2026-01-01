const express = require('express');
const passport = require('passport');
const { pool } = require('../config/postgresql');

const router = express.Router();
const authenticateJWT = passport.authenticate('jwt', { session: false });

// Get all approved stories (public)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const storiesQuery = `
      SELECT 
        ts.*,
        u.first_name,
        u.last_name,
        u.avatar_url
      FROM traveler_stories ts
      LEFT JOIN users u ON ts.user_id = u.id
      WHERE ts.is_approved = true AND ts.is_active = true
      ORDER BY ts.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const storiesResult = await pool.query(storiesQuery, [parseInt(limit), offset]);

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM traveler_stories 
      WHERE is_approved = true AND is_active = true
    `;
    const countResult = await pool.query(countQuery);
    const total = parseInt(countResult.rows[0].total);

    const stories = storiesResult.rows.map(s => ({
      id: s.id,
      user_id: s.user_id,
      title: s.title,
      story: s.story,
      location: s.location,
      duration: s.duration,
      highlights: s.highlights,
      media: s.media,
      likes_count: s.likes_count || 0,
      comments_count: s.comments_count || 0,
      is_approved: s.is_approved,
      is_active: s.is_active,
      is_featured: s.is_featured,
      created_at: s.created_at,
      updated_at: s.updated_at,
      user: {
        first_name: s.first_name,
        last_name: s.last_name,
        avatar_url: s.avatar_url
      }
    }));

    res.json({
      success: true,
      stories,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('❌ GET STORIES Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching stories' });
  }
});

// Get my stories (for logged in user)
router.get('/my-stories', authenticateJWT, async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    
    const query = `
      SELECT * FROM traveler_stories 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [userId]);

    res.json({
      success: true,
      stories: result.rows
    });
  } catch (error) {
    console.error('❌ GET MY STORIES Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching your stories' });
  }
});

// Get featured stories for homepage
router.get('/featured', async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    
    const query = `
      SELECT 
        ts.*,
        u.first_name,
        u.last_name,
        u.avatar_url
      FROM traveler_stories ts
      LEFT JOIN users u ON ts.user_id = u.id
      WHERE ts.is_approved = true AND ts.is_active = true AND ts.is_featured = true
      ORDER BY ts.created_at DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [parseInt(limit)]);

    console.log(`📖 Featured stories: Found ${result.rows.length} featured stories`);

    const stories = result.rows.map(s => ({
      id: s.id,
      user_id: s.user_id,
      title: s.title,
      story: s.story,
      location: s.location,
      duration: s.duration,
      highlights: s.highlights,
      media: s.media,
      likes_count: s.likes_count || 0,
      comments_count: s.comments_count || 0,
      is_featured: s.is_featured,
      created_at: s.created_at,
      user: {
        first_name: s.first_name,
        last_name: s.last_name,
        avatar_url: s.avatar_url
      }
    }));

    res.json({
      success: true,
      stories
    });
  } catch (error) {
    console.error('Get featured stories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured stories'
    });
  }
});

// Backup featured endpoint
router.get('/featured-backup', async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    
    const query = `
      SELECT 
        ts.*,
        u.first_name,
        u.last_name,
        u.avatar_url
      FROM traveler_stories ts
      LEFT JOIN users u ON ts.user_id = u.id
      WHERE ts.is_approved = true AND ts.is_active = true
      ORDER BY ts.created_at DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [parseInt(limit)]);

    console.log(`📖 Featured backup stories: Found ${result.rows.length} stories`);

    const stories = result.rows.map(s => ({
      id: s.id,
      user_id: s.user_id,
      title: s.title,
      story: s.story,
      location: s.location,
      duration: s.duration,
      highlights: s.highlights,
      media: s.media,
      likes_count: s.likes_count || 0,
      comments_count: s.comments_count || 0,
      created_at: s.created_at,
      user: {
        first_name: s.first_name,
        last_name: s.last_name,
        avatar_url: s.avatar_url
      }
    }));

    res.json({
      success: true,
      stories
    });
  } catch (error) {
    console.error('Get featured backup stories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured stories'
    });
  }
});

// Get story by ID
router.get('/:id', async (req, res) => {
  try {
    const storyId = parseInt(req.params.id);
    if (isNaN(storyId)) {
      return res.status(400).json({ success: false, message: 'Invalid story ID' });
    }

    const storyQuery = `
      SELECT 
        ts.*,
        u.first_name,
        u.last_name,
        u.avatar_url
      FROM traveler_stories ts
      LEFT JOIN users u ON ts.user_id = u.id
      WHERE ts.id = $1
    `;
    
    const storyResult = await pool.query(storyQuery, [storyId]);

    if (storyResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    const s = storyResult.rows[0];

    // Get comments
    const commentsQuery = `
      SELECT 
        sc.*,
        u.first_name,
        u.last_name,
        u.avatar_url
      FROM story_comments sc
      LEFT JOIN users u ON sc.user_id = u.id
      WHERE sc.story_id = $1
      ORDER BY sc.created_at DESC
      LIMIT 20
    `;
    
    const commentsResult = await pool.query(commentsQuery, [storyId]);

    const comments = commentsResult.rows.map(c => ({
      id: c.id,
      story_id: c.story_id,
      user_id: c.user_id,
      comment: c.comment,
      created_at: c.created_at,
      user: {
        first_name: c.first_name,
        last_name: c.last_name,
        avatar_url: c.avatar_url
      }
    }));

    const story = {
      id: s.id,
      user_id: s.user_id,
      title: s.title,
      story: s.story,
      location: s.location,
      duration: s.duration,
      highlights: s.highlights,
      media: s.media,
      likes_count: s.likes_count || 0,
      comments_count: s.comments_count || 0,
      is_approved: s.is_approved,
      is_active: s.is_active,
      is_featured: s.is_featured,
      created_at: s.created_at,
      updated_at: s.updated_at,
      user: {
        first_name: s.first_name,
        last_name: s.last_name,
        avatar_url: s.avatar_url
      },
      comments
    };

    res.json({ success: true, story });
  } catch (error) {
    console.error('❌ GET STORY Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching story' });
  }
});

// Create new story
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { title, story, location, duration, highlights, media } = req.body;

    const query = `
      INSERT INTO traveler_stories (user_id, title, story, location, duration, highlights, media, is_approved, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, false, false, NOW(), NOW())
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      parseInt(req.user.id),
      title,
      story,
      location,
      duration,
      JSON.stringify(highlights || []),
      JSON.stringify(media || [])
    ]);

    res.status(201).json({
      success: true,
      message: 'Story submitted successfully! It will be published after admin approval.',
      story: result.rows[0]
    });
  } catch (error) {
    console.error('❌ CREATE STORY Error:', error);
    res.status(500).json({ success: false, message: 'Error creating story' });
  }
});

// Like story
router.post('/:id/like', authenticateJWT, async (req, res) => {
  try {
    const storyId = parseInt(req.params.id);
    const userId = parseInt(req.user.id);
    
    if (isNaN(storyId)) {
      return res.status(400).json({ success: false, message: 'Invalid story ID' });
    }

    // Check if already liked
    const checkQuery = `SELECT id FROM story_likes WHERE story_id = $1 AND user_id = $2`;
    const checkResult = await pool.query(checkQuery, [storyId, userId]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Already liked' });
    }

    // Add like
    await pool.query(
      `INSERT INTO story_likes (story_id, user_id, created_at) VALUES ($1, $2, NOW())`,
      [storyId, userId]
    );

    // Update likes count
    await pool.query(
      `UPDATE traveler_stories SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = $1`,
      [storyId]
    );

    res.json({ success: true, message: 'Story liked' });
  } catch (error) {
    console.error('❌ LIKE STORY Error:', error);
    res.status(500).json({ success: false, message: 'Error liking story' });
  }
});

// Add comment
router.post('/:id/comment', authenticateJWT, async (req, res) => {
  try {
    const storyId = parseInt(req.params.id);
    const userId = parseInt(req.user.id);
    
    if (isNaN(storyId)) {
      return res.status(400).json({ success: false, message: 'Invalid story ID' });
    }

    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Comment is required' });
    }

    // Add comment
    const insertQuery = `
      INSERT INTO story_comments (story_id, user_id, comment, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    const result = await pool.query(insertQuery, [storyId, userId, comment.trim()]);

    // Update comments count
    await pool.query(
      `UPDATE traveler_stories SET comments_count = COALESCE(comments_count, 0) + 1 WHERE id = $1`,
      [storyId]
    );

    res.status(201).json({ success: true, message: 'Comment added', comment: result.rows[0] });
  } catch (error) {
    console.error('❌ ADD COMMENT Error:', error);
    res.status(500).json({ success: false, message: 'Error adding comment' });
  }
});

module.exports = router;
