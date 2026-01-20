import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { API_URL } from '../../../utils/api';

const TravelerStoriesSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStory, setActiveStory] = useState(0);
  const [travelerStories, setTravelerStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedStories();
  }, []);

  const fetchFeaturedStories = async () => {
    try {
      const response = await fetch(`${API_URL}/traveler-stories`);
      
      // Check if response is ok
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
      
      if (data.success && data.stories && data.stories.length > 0) {
        setTravelerStories(data.stories);
      }
    } catch (err) {
      console.error('Error fetching stories:', err);
    } finally {
      setLoading(false);
    }
  };

  const nextStory = () => {
    setActiveStory((prev) => (prev + 1) % travelerStories?.length);
  };

  const prevStory = () => {
    setActiveStory((prev) => (prev - 1 + travelerStories?.length) % travelerStories?.length);
  };

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Icon name="Loader2" size={48} className="mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading traveler stories...</p>
          </div>
        </div>
      </section>
    );
  }

  if (travelerStories.length === 0) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-display font-medium text-foreground mb-6">
              Traveler Stories
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Discover amazing travel experiences from our community!
            </p>
          </div>
        </div>
      </section>
    );
  }

  const currentStory = travelerStories[activeStory];
  let media = [];
  try {
    if (currentStory.media) {
      media = typeof currentStory.media === 'string' 
        ? JSON.parse(currentStory.media) 
        : currentStory.media;
    }
  } catch (e) {
    console.error('Error parsing media:', e);
    media = [];
  }
  const mainMedia = media[0] || {};

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-display font-medium text-foreground mb-6">
            Traveler Stories
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real experiences from real travelers who discovered the world through iSafari
          </p>
        </div>

        <div className="relative">
          {/* Main Story Display */}
          <div className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border">
            <div className="flex flex-col">
              {/* Story Image/Video - Top */}
              <div className="w-full relative">
                <div className="w-full h-[500px]">
                  {mainMedia.type === 'video' ? (
                    <video
                      src={mainMedia.url}
                      className="w-full h-full object-cover"
                      controls
                      poster={mainMedia.url}
                    />
                  ) : mainMedia.url ? (
                    <img
                      src={mainMedia.url}
                      alt={currentStory.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                      <Icon name="Image" size={64} className="text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Location Badge */}
                <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                  <Icon name="MapPin" size={16} className="inline mr-2" />
                  {currentStory.location}
                </div>
              </div>

              {/* Story Content - Bottom */}
              <div className="w-full p-6 md:p-8 lg:p-10">
                <div className="flex items-center mb-6">
                  {currentStory.profile_image ? (
                    <img
                      src={currentStory.profile_image}
                      alt={`${currentStory.first_name} ${currentStory.last_name}`}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <Icon name="User" size={20} className="text-primary" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-card-foreground">
                      {currentStory.first_name} {currentStory.last_name}
                    </h4>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Icon name="Clock" size={14} className="mr-1" />
                      {currentStory.duration || 'Amazing journey'}
                    </div>
                  </div>
                </div>

                <h3 className="text-3xl font-display font-bold text-card-foreground mb-4">
                  {currentStory.title}
                </h3>

                {/* Likes & Comments */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Icon name="Heart" size={18} className="mr-2" />
                    <span className="font-medium">{currentStory.likes_count || 0}</span> likes
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Icon name="MessageCircle" size={18} className="mr-2" />
                    <span className="font-medium">{currentStory.comments_count || 0}</span> comments
                  </div>
                </div>

                <p className="text-foreground text-lg mb-6 leading-relaxed whitespace-pre-line">
                  {currentStory.story}
                </p>

                {/* Highlights */}
                {Array.isArray(currentStory.highlights) && currentStory.highlights.length > 0 && (
                  <div className="mb-6">
                    <h5 className="font-semibold text-card-foreground mb-3">Experience Highlights:</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentStory.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-center text-sm text-muted-foreground">
                          <Icon name="Check" size={14} className="text-primary mr-2 flex-shrink-0" />
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button variant="outline" size="sm">
                  <Icon name="ExternalLink" size={16} />
                  Read Full Story
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <button
            onClick={prevStory}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-card hover:bg-muted rounded-full flex items-center justify-center shadow-lg border border-border transition-all duration-200"
          >
            <Icon name="ChevronLeft" size={20} />
          </button>
          
          <button
            onClick={nextStory}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-card hover:bg-muted rounded-full flex items-center justify-center shadow-lg border border-border transition-all duration-200"
          >
            <Icon name="ChevronRight" size={20} />
          </button>
        </div>

        {/* Story Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {travelerStories?.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveStory(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === activeStory ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>


      </div>
    </section>
  );
};

export default TravelerStoriesSection;