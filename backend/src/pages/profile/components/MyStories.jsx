import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { API_URL } from '../../../utils/api';

const MyStories = ({ profileData, autoOpenCreate = false }) => {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    story: '',
    location: '',
    duration: '',
    highlights: []
  });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMyStories();
  }, []);

  // Auto-open create modal if requested via URL params
  useEffect(() => {
    if (autoOpenCreate && !loading) {
      setShowCreateModal(true);
    }
  }, [autoOpenCreate, loading]);

  const fetchMyStories = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = user.token;
      
      if (!token) {
        console.error('No auth token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/traveler-stories/my-stories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.log('Stories endpoint not available yet');
        setLoading(false);
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.log('Stories endpoint returned non-JSON response');
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        setStories(data.stories || []);
      }
    } catch (err) {
      console.error('Error fetching stories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = user.token;
      
      if (!token) {
        alert('Please login again to submit a story');
        setUploading(false);
        return;
      }

      const formDataToSend = new FormData();
      
      formDataToSend.append('title', formData.title);
      formDataToSend.append('story', formData.story);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('highlights', JSON.stringify(formData.highlights));

      // Append media files
      mediaFiles.forEach(file => {
        formDataToSend.append('media', file);
      });

      const response = await fetch(`${API_URL}/traveler-stories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (data.success) {
        alert('Story submitted successfully! It will be published after admin approval.');
        setShowCreateModal(false);
        setFormData({
          title: '',
          story: '',
          location: '',
          duration: '',
          highlights: []
        });
        setMediaFiles([]);
        fetchMyStories();
      } else {
        alert(data.message || 'Failed to submit story');
      }
    } catch (err) {
      console.error('Error submitting story:', err);
      alert(`Failed to submit story: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (storyId) => {
    if (!confirm('Are you sure you want to delete this story?')) return;

    try {
      const user = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = user.token;
      
      if (!token) {
        alert('Please login again to delete a story');
        return;
      }

      const response = await fetch(`${API_URL}/traveler-stories/${storyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Story deleted successfully');
        fetchMyStories();
      }
    } catch (err) {
      console.error('Error deleting story:', err);
      alert('Failed to delete story');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Icon name="Loader2" size={48} className="mx-auto mb-4 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your stories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-foreground">My Travel Stories</h3>
          <p className="text-muted-foreground">Share your travel experiences with the community</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Icon name="Plus" size={20} />
          Share New Story
        </Button>
      </div>

      {stories.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Icon name="BookOpen" size={48} className="mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Stories Yet</h3>
          <p className="text-muted-foreground mb-6">Share your travel experiences and inspire others!</p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Icon name="Plus" size={20} />
            Share Your First Story
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stories.map((story) => {
            let media = [];
            try {
              if (story.media) {
                media = typeof story.media === 'string' ? JSON.parse(story.media) : story.media;
              }
            } catch (e) {
              console.error('Error parsing media:', e);
              media = [];
            }
            const mainMedia = media[0] || {};

            return (
              <div key={story.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {/* Story Image/Video */}
                <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10">
                  {mainMedia.type === 'video' ? (
                    <video
                      src={mainMedia.url}
                      className="w-full h-full object-cover"
                    />
                  ) : mainMedia.url ? (
                    <img
                      src={mainMedia.url}
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="Image" size={48} className="text-muted-foreground/50" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {story.is_approved ? (
                      <span className="bg-success/90 text-white px-3 py-1 rounded-full text-xs font-medium">
                        <Icon name="Check" size={12} className="inline mr-1" />
                        Published
                      </span>
                    ) : (
                      <span className="bg-warning/90 text-white px-3 py-1 rounded-full text-xs font-medium">
                        <Icon name="Clock" size={12} className="inline mr-1" />
                        Pending Review
                      </span>
                    )}
                  </div>
                </div>

                {/* Story Content */}
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Icon name="MapPin" size={14} />
                    {story.location}
                  </div>

                  <h4 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                    {story.title}
                  </h4>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {story.story}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Icon name="Heart" size={14} />
                      {story.likes_count || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="MessageCircle" size={14} />
                      {story.comments_count || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="Calendar" size={14} />
                      {new Date(story.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(story.id)}
                    >
                      <Icon name="Trash2" size={14} />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Story Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">Share Your Travel Story</h3>
              <button onClick={() => setShowCreateModal(false)}>
                <Icon name="X" size={20} className="text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Author Preview */}
              <div className="bg-muted/30 rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground mb-2">Story will be published as:</p>
                <div className="flex items-center gap-3">
                  {profileData?.avatar ? (
                    <img
                      src={profileData.avatar}
                      alt={`${profileData.firstName} ${profileData.lastName}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon name="User" size={18} className="text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-foreground">
                      {profileData?.firstName} {profileData?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {profileData?.email}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Tip: Click the camera icon above to update your profile photo
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Story Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Amazing Safari in Serengeti"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Serengeti National Park, Tanzania"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Duration (optional)
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 7 days"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Story Content */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Your Story *
                </label>
                <textarea
                  required
                  value={formData.story}
                  onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                  placeholder="Share your travel experience, what made it special, and what you learned..."
                  rows={6}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Media Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Photos/Videos (up to 5 files)
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="media-upload"
                    max="5"
                  />
                  <label htmlFor="media-upload" className="cursor-pointer">
                    <Icon name="Upload" size={32} className="mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Click to upload images or videos
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Max 5 files, up to 50MB each
                    </p>
                  </label>
                  {mediaFiles.length > 0 && (
                    <div className="mt-4 text-sm text-foreground">
                      {mediaFiles.length} file(s) selected
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCreateModal(false)}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Icon name="Loader2" size={16} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Icon name="Send" size={16} />
                      Submit Story
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Your story will be reviewed before being published on the homepage
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyStories;
