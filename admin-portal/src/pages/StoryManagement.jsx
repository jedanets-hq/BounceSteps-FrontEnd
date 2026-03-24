import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Trash2, 
  User, 
  MapPin, 
  Calendar,
  Filter,
  RefreshCw,
  BookOpen
} from 'lucide-react';

// 🚨 PRODUCTION FIX: Remove localhost fallback - MUST have VITE_API_URL set
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('🚨 VITE_API_URL environment variable is required in production');
}

const StoryManagement = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedStory, setSelectedStory] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadStories();
  }, [filter]);

  const loadStories = async () => {
    try {
      setLoading(true);

      const url = filter === 'all' 
        ? `${API_URL}/traveler-stories/admin/all`
        : `${API_URL}/traveler-stories/admin/all?status=${filter}`;

      console.log('🔍 Loading stories from:', url);

      const response = await fetch(url);

      console.log('📡 Response status:', response.status);

      const data = await response.json();
      
      console.log('📦 Response data:', data);
      
      if (data.success) {
        console.log('✅ Stories loaded:', data.stories.length);
        setStories(data.stories);
      } else {
        console.error('❌ Failed to load stories:', data.message);
        setStories([]);
      }
    } catch (error) {
      console.error('❌ Error loading stories:', error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (storyId) => {
    if (!confirm('Approve this story?')) return;

    try {
      const response = await fetch(`${API_URL}/traveler-stories/${storyId}/approve`, {
        method: 'PUT'
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Story approved successfully!');
        loadStories();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error approving story:', error);
      alert('❌ Failed to approve story');
    }
  };

  const handleReject = async (storyId) => {
    if (!confirm('Reject this story?')) return;

    try {
      const response = await fetch(`${API_URL}/traveler-stories/${storyId}/reject`, {
        method: 'PUT'
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Story rejected');
        loadStories();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error rejecting story:', error);
      alert('❌ Failed to reject story');
    }
  };

  const handleDelete = async (storyId) => {
    if (!confirm('Delete this story permanently?')) return;

    try {
      const response = await fetch(`${API_URL}/traveler-stories/admin/${storyId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Story deleted successfully');
        loadStories();
        setShowModal(false);
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('❌ Failed to delete story');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon size={14} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen size={28} />
            Story Management
          </h1>
          <p className="text-muted-foreground mt-1">Review and manage traveler stories</p>
        </div>
        <button
          onClick={loadStories}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:bg-muted'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Stories List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <BookOpen size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No stories found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {stories.map((story) => (
            <div key={story.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{story.title}</h3>
                    {getStatusBadge(story.status)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>{story.first_name} {story.last_name}</span>
                    </div>
                    {story.location && (
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span>{story.location}</span>
                      </div>
                    )}
                    {story.trip_date && (
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{new Date(story.trip_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-foreground line-clamp-3">{story.content}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-border">
                <button
                  onClick={() => {
                    setSelectedStory(story);
                    setShowModal(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  <Eye size={14} />
                  View Details
                </button>

                {story.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(story.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                    >
                      <CheckCircle size={14} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(story.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleDelete(story.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm ml-auto"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Story Detail Modal */}
      {showModal && selectedStory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">{selectedStory.title}</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                {getStatusBadge(selectedStory.status)}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User size={16} />
                  <span>{selectedStory.first_name} {selectedStory.last_name}</span>
                  <span>({selectedStory.email})</span>
                </div>
              </div>

              {selectedStory.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin size={16} />
                  <span>{selectedStory.location}</span>
                </div>
              )}

              {selectedStory.trip_date && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={16} />
                  <span>{new Date(selectedStory.trip_date).toLocaleDateString()}</span>
                </div>
              )}

              <div className="pt-4">
                <h3 className="font-semibold text-foreground mb-2">Story Content:</h3>
                <p className="text-foreground whitespace-pre-wrap">{selectedStory.content}</p>
              </div>

              <div className="flex gap-2 pt-4 border-t border-border">
                {selectedStory.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedStory.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle size={16} />
                      Approve Story
                    </button>
                    <button
                      onClick={() => handleReject(selectedStory.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle size={16} />
                      Reject Story
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(selectedStory.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ml-auto"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryManagement;
