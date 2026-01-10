import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const InspirationFeed = ({ inspirations }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Compass" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-display text-lg font-medium">Inspiration Feed</h3>
            <p className="text-sm text-muted-foreground">Personalized recommendations just for you</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          alert('Refreshing inspiration feed...');
        }}>
          <Icon name="RefreshCw" size={16} />
          Refresh
        </Button>
      </div>
      
      <div className="space-y-4">
        {inspirations?.map((item) => (
          <div key={item?.id} className="border border-border rounded-lg overflow-hidden hover:shadow-sm transition-all duration-200">
            <div className="flex">
              <div className="w-24 h-24 flex-shrink-0">
                <Image
                  src={item?.image}
                  alt={item?.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-foreground">{item?.title}</h4>
                    <p className="text-sm text-muted-foreground">{item?.location}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="TrendingUp" size={12} className="text-success" />
                    <span className="text-xs text-success">{item?.trending}</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item?.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Icon name="Calendar" size={12} />
                      <span>{item?.bestTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="DollarSign" size={12} />
                      <span>{item?.priceRange}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Clock" size={12} />
                      <span>{item?.duration}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const savedBookmarks = JSON.parse(localStorage.getItem('bookmarked_destinations') || '[]');
                        const isBookmarked = savedBookmarks.some(b => b.id === item.id);
                        
                        if (isBookmarked) {
                          const updated = savedBookmarks.filter(b => b.id !== item.id);
                          localStorage.setItem('bookmarked_destinations', JSON.stringify(updated));
                          alert('Removed from bookmarks');
                        } else {
                          savedBookmarks.push(item);
                          localStorage.setItem('bookmarked_destinations', JSON.stringify(savedBookmarks));
                          alert('Added to bookmarks');
                        }
                      }}
                    >
                      <Icon name="Bookmark" size={12} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-6 px-3 text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/destination-discovery?search=${encodeURIComponent(item.location)}&category=${encodeURIComponent(item.title)}`;
                      }}
                    >
                      Explore
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = '/destination-discovery';
          }}
        >
          <Icon name="Plus" size={16} />
          View More Recommendations
        </Button>
      </div>
    </div>
  );
};

export default InspirationFeed;