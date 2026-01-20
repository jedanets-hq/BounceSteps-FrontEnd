import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { API_URL } from '../../../utils/api';

const LiveActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState({
    weeklyBookings: 0,
    activeTravelers: 0,
    destinations: 0,
    totalServices: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch real activities from backend
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/bookings/public/recent-activity?limit=20`);
        const data = await response.json();

        if (data.success && data.activities) {
          // Format activities with icons and colors
          const formattedActivities = data.activities.map(activity => ({
            ...activity,
            icon: getIconForCategory(activity.category),
            color: getColorForCategory(activity.category),
            timestamp: formatTimestamp(activity.timestamp)
          }));

          setActivities(formattedActivities);
          setStats(data.stats || stats);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
    // Refresh every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activities?.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % Math.min(activities?.length, 4));
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [activities?.length]);

  // Format timestamp
  const formatTimestamp = (date) => {
    if (!date) return 'Just now';
    const now = new Date();
    const activityDate = new Date(date);
    const diffMs = now - activityDate;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  // Get icon based on category
  const getIconForCategory = (category) => {
    const iconMap = {
      'accommodation': 'Building',
      'tour': 'MapPin',
      'transport': 'Car',
      'food': 'Utensils',
      'adventure': 'Mountain',
      'culture': 'Users',
      'wildlife': 'Camera'
    };
    return iconMap[category] || 'MapPin';
  };

  // Get color based on category
  const getColorForCategory = (category) => {
    const colorMap = {
      'accommodation': 'text-purple-600',
      'tour': 'text-blue-600',
      'transport': 'text-orange-600',
      'food': 'text-red-600',
      'adventure': 'text-green-600',
      'culture': 'text-indigo-600',
      'wildlife': 'text-yellow-600'
    };
    return colorMap[category] || 'text-blue-600';
  };

  const getVisibleActivities = () => {
    if (!activities || activities.length === 0) return [];
    const visibleCount = 4;
    const result = [];
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % activities.length;
      if (activities[index]) {
        result.push(activities[index]);
      }
    }
    return result;
  };

  return (
    <section className="py-12 sm:py-16 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-display font-medium text-foreground mb-1 sm:mb-2">
              Live Activity Feed
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              See what's happening in the iSafari community right now
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm text-muted-foreground">Live</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && activities.length === 0 && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading activities...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && activities.length === 0 && (
          <div className="text-center py-8 bg-card rounded-lg border border-border">
            <Icon name="Activity" size={48} className="mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No recent activity yet. Be the first to book!</p>
          </div>
        )}

        {/* Activity Feed */}
        {activities.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          {getVisibleActivities().map((activity, index) => (
            <div
              key={`activity-${activity?.id || 'default'}-${index}-${activity?.timestamp || Date.now()}`}
              className={`flex items-start space-x-2 sm:space-x-4 p-3 sm:p-4 bg-card rounded-lg border border-border transition-all duration-500 ${
                index === 0 ? 'opacity-100 scale-100' : 'opacity-80 scale-98'
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'slideInRight 0.5s ease-out'
              }}
            >
              {/* Activity Icon */}
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${activity?.color}`}>
                <Icon name={activity?.icon} size={16} className="sm:w-[18px] sm:h-[18px]" />
              </div>

              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-0">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-card-foreground">
                      <span className="font-medium">{activity?.user}</span>{' '}
                      <span className="text-muted-foreground">{activity?.action}</span>
                    </p>
                    {activity?.location && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center">
                        <Icon name="MapPin" size={10} className="mr-1 sm:w-3 sm:h-3" />
                        <span className="truncate">{activity?.location}</span>
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground sm:ml-4 flex-shrink-0">
                    {activity?.timestamp}
                  </span>
                </div>
              </div>

              {/* Activity Type Badge - Hidden on mobile */}
              <div className={`hidden sm:block px-2 py-1 rounded-full text-xs font-medium ${
                activity?.type === 'exclusive' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {activity?.type === 'exclusive' ? 'Exclusive' : 'Booking'}
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Activity Stats */}
        <div className="mt-6 sm:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 pt-6 sm:pt-8 border-t border-border">
          <div key="stat-weekly" className="text-center bg-card p-3 sm:p-4 rounded-lg border border-border">
            <div className="text-xl sm:text-2xl font-bold text-primary mb-1">
              {stats.weeklyBookings || 0}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Bookings This Week</div>
          </div>
          <div key="stat-travelers" className="text-center bg-card p-3 sm:p-4 rounded-lg border border-border">
            <div className="text-xl sm:text-2xl font-bold text-primary mb-1">
              {stats.activeTravelers || 0}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Active Travelers</div>
          </div>
          <div key="stat-destinations" className="text-center bg-card p-3 sm:p-4 rounded-lg border border-border">
            <div className="text-xl sm:text-2xl font-bold text-primary mb-1">
              {stats.destinations || 0}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Destinations</div>
          </div>
          <div key="stat-services" className="text-center bg-card p-3 sm:p-4 rounded-lg border border-border">
            <div className="text-xl sm:text-2xl font-bold text-primary mb-1">
              {stats.totalServices || 0}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Active Services</div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
};

export default LiveActivityFeed;