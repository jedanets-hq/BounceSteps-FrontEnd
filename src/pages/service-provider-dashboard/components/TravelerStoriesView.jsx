import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { API_URL } from '../../../utils/api';

const TravelerStoriesView = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await fetch(`${API_URL}/traveler-stories?limit=20`);
      
      if (!response.ok) {
        console.log('Stories endpoint not available');
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
      
      if (data.success && data.stories) {
        setStories(data.stories);
      }
    } catch (err) {
      console.error('Error fetching stories:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Icon name="Loader2" size={48} className="mx-auto mb-4 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading traveler stories...</p>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon name="BookOpen" size={48} className="mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Stories Yet</h3>
        <p className="text-muted-foreground">
          Traveler stories will appear here once they are published.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Traveler Stories</h2>
          <p className="text-muted-foreground mt-1">
            See what travelers are saying about their experiences
          </p>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => {
          const media = story.media ? JSON.parse(story.media) : [];
          const mainMedia = media[0] || {};

          return (
            <div
              key={story.id}
              className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedStory(story)}
            >
              {/* Story Image/Video */}
              <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10">
                {mainMedia.type === 'video' ? (
                  <video
                    src={mainMedia.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : mainMedia.url ? (
                  <img
                    src={mainMedia.url}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="Image" size={48} className="text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Story Content */}
              <div className="p-4">
                {/* Author Info */}
                <div className="flex items-center gap-2 mb-3">
                  {story.profile_image ? (
                    <img
                      src={story.profile_image}
                      alt={`${story.first_name} ${story.last_name}`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon name="User" size={14} className="text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {story.first_name} {story.last_name}
                    </p>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                  {story.title}
                </h3>

                {/* Location & Duration */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  {story.location && (
                    <div className="flex items-center gap-1">
                      <Icon name="MapPin" size={14} />
                      <span>{story.location}</span>
                    </div>
                  )}
                  {story.duration && (
                    <div className="flex items-center gap-1">
                      <Icon name="Clock" size={14} />
                      <span>{story.duration}</span>
                    </div>
                  )}
                </div>

                {/* Story Preview */}
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {story.story}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Icon name="Heart" size={14} />
                    <span>{story.likes_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="MessageCircle" size={14} />
                    <span>{story.comments_count || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Story Detail Modal */}
      {selectedStory && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedStory(null)}
        >
          <div
            className="bg-card rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">Story Details</h3>
              <button
                onClick={() => setSelectedStory(null)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Icon name="X" size={20} className="text-muted-foreground" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Author Info */}
              <div className="flex items-center gap-3 mb-6">
                {selectedStory.profile_image ? (
                  <img
                    src={selectedStory.profile_image}
                    alt={`${selectedStory.first_name} ${selectedStory.last_name}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon name="User" size={20} className="text-primary" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground">
                    {selectedStory.first_name} {selectedStory.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedStory.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {selectedStory.title}
              </h2>

              {/* Location & Duration */}
              <div className="flex items-center gap-6 mb-6">
                {selectedStory.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon name="MapPin" size={16} />
                    <span>{selectedStory.location}</span>
                  </div>
                )}
                {selectedStory.duration && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon name="Clock" size={16} />
                    <span>{selectedStory.duration}</span>
                  </div>
                )}
              </div>

              {/* Media Gallery */}
              {(() => {
                const media = selectedStory.media ? JSON.parse(selectedStory.media) : [];
                if (media.length > 0) {
                  return (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {media.map((item, index) => (
                        <div key={index} className="rounded-lg overflow-hidden">
                          {item.type === 'video' ? (
                            <video
                              src={item.url}
                              controls
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <img
                              src={item.url}
                              alt={`Media ${index + 1}`}
                              className="w-full h-48 object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              })()}

              {/* Story Content */}
              <div className="prose prose-sm max-w-none mb-6">
                <p className="text-foreground whitespace-pre-wrap">{selectedStory.story}</p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="Heart" size={18} />
                  <span>{selectedStory.likes_count || 0} likes</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="MessageCircle" size={18} />
                  <span>{selectedStory.comments_count || 0} comments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelerStoriesView;
