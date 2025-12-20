const express = require('express');
const passport = require('passport');
const { TravelerStory, StoryLike, StoryComment, User } = require('../models');
const { serializeDocument, isValidObjectId, toObjectId } = require('../utils/pg-helpers');

const router = express.Router();
const authenticateJWT = passport.authenticate('jwt', { session: false });

// Get all approved stories (public)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const stories = await TravelerStory.find({ is_approved: true, is_active: true })
      .populate('user_id', 'first_name last_name avatar_url')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await TravelerStory.countDocuments({ is_approved: true, is_active: true });

    res.json({
      success: true,
      stories: stories.map(s => serializeDocument(s)),
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
    
    // Get all stories by this user (including pending ones)
    const stories = await TravelerStory.find({ user_id: userId });

    res.json({
      success: true,
      stories: stories.map(s => serializeDocument(s))
    });
  } catch (error) {
    console.error('❌ GET MY STORIES Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching your stories' });
  }
});

// Get story by ID
router.get('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid story ID' });
    }

    const story = await TravelerStory.findById(req.params.id)
      .populate('user_id', 'first_name last_name avatar_url')
      .lean();

    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    const comments = await StoryComment.find({ story_id: story.id })
      .populate('user_id', 'first_name last_name avatar_url')
      .sort({ created_at: -1 })
      .limit(20)
      .lean();

    res.json({
      success: true,
      story: {
        ...serializeDocument(story),
        comments: comments.map(c => serializeDocument(c))
      }
    });
  } catch (error) {
    console.error('❌ GET STORY Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching story' });
  }
});

// Create new story
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { title, story, location, duration, highlights, media } = req.body;

    // Stories are NOT approved by default - admin must approve before publishing
    const newStory = await TravelerStory.create({
      user_id: parseInt(req.user.id),
      title,
      story,
      location,
      duration,
      highlights: highlights || [],
      media: media || [],
      is_approved: false,  // Not approved by default
      is_active: false     // Not active until admin approves
    });

    res.status(201).json({
      success: true,
      message: 'Story submitted successfully! It will be published after admin approval.',
      story: serializeDocument(newStory)
    });
  } catch (error) {
    console.error('❌ CREATE STORY Error:', error);
    res.status(500).json({ success: false, message: 'Error creating story' });
  }
});

// Like story
router.post('/:id/like', authenticateJWT, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid story ID' });
    }

    const existingLike = await StoryLike.findOne({
      story_id: parseInt(req.params.id),
      user_id: parseInt(req.user.id)
    });

    if (existingLike) {
      return res.status(400).json({ success: false, message: 'Already liked' });
    }

    const like = StoryLike.create({
      story_id: parseInt(req.params.id),
      user_id: parseInt(req.user.id)
    });

    await like.save();
    await TravelerStory.findByIdAndUpdate(req.params.id, { $inc: { likes_count: 1 } });

    res.json({ success: true, message: 'Story liked' });
  } catch (error) {
    console.error('❌ LIKE STORY Error:', error);
    res.status(500).json({ success: false, message: 'Error liking story' });
  }
});

// Add comment
router.post('/:id/comment', authenticateJWT, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid story ID' });
    }

    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Comment is required' });
    }

    const newComment = StoryComment.create({
      story_id: parseInt(req.params.id),
      user_id: parseInt(req.user.id),
      comment: comment.trim()
    });

    await newComment.save();
    await TravelerStory.findByIdAndUpdate(req.params.id, { $inc: { comments_count: 1 } });

    res.status(201).json({ success: true, message: 'Comment added', comment: serializeDocument(newComment) });
  } catch (error) {
    console.error('❌ ADD COMMENT Error:', error);
    res.status(500).json({ success: false, message: 'Error adding comment' });
  }
});
// Get featured stories for homepage
// Backup featured endpoint with mock data
router.get('/featured-backup', async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    
    // Get any approved stories as featured
    const stories = await TravelerStory.find({ 
      is_approved: true, 
      is_active: true 
    })
      .populate('user_id', 'first_name last_name avatar_url')
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .lean();

    console.log(`📖 Featured backup stories: Found ${stories.length} stories`);

    const enrichedStories = stories.map(story => ({
      ...serializeDocument(story),
      user: story.user_id ? serializeDocument(story.user_id) : null
    }));

    res.json({
      success: true,
      stories: enrichedStories
    });
  } catch (error) {
    console.error('Get featured backup stories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured stories'
    });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    
    const stories = await TravelerStory.find({ 
      is_approved: true, 
      is_active: true,
      is_featured: true 
    })
      .populate('user_id', 'first_name last_name avatar_url')
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .lean();

    console.log(`📖 Featured stories: Found ${stories.length} featured stories`);

    const enrichedStories = stories.map(story => ({
      ...serializeDocument(story),
      user: story.user_id ? serializeDocument(story.user_id) : null
    }));

    res.json({
      success: true,
      stories: enrichedStories
    });
  } catch (error) {
    console.error('Get featured stories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured stories'
    });
  }
});


module.exports = router;
