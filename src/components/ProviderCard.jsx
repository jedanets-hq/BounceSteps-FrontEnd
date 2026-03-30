import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './AppIcon';
import Button from './ui/Button';
import ProviderBadge from './ui/ProviderBadge';
import { useFavorites } from '../contexts/FavoritesContext';
import { bookingsAPI } from '../utils/api';

const ProviderCard = ({ provider, onViewProfile, onSelect, isSelected }) => {
  const navigate = useNavigate();
  const { addToFavorites, isFavorite } = useFavorites();
  return (
    <div className={`bg-card border rounded-lg p-4 sm:p-6 transition-all hover:shadow-lg ${
      isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'
    }`}>
      {/* Mobile-optimized header layout */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3 sm:space-x-4">
          {provider.avatar_url ? (
            <img
              src={provider.avatar_url}
              alt={provider.business_name}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon name="Briefcase" size={20} className="text-primary sm:w-6 sm:h-6" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 flex-wrap">
              <h3 className="font-semibold text-base sm:text-lg text-foreground leading-tight">{provider.business_name}</h3>
              {/* Display badges from database (can be multiple) */}
              {provider.badges && provider.badges.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {provider.badges.map((badge, index) => (
                    <ProviderBadge key={index} badgeType={badge.badge_type} size="sm" showText={false} />
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{provider.business_type}</p>
            {/* Show badges with text below name */}
            {provider.badges && provider.badges.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {provider.badges.map((badge, index) => (
                  <ProviderBadge key={index} badgeType={badge.badge_type} size="xs" showText={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center text-sm text-muted-foreground mb-3">
        <Icon name="MapPin" size={14} className="mr-2 flex-shrink-0" />
        <span className="truncate">{provider.location}</span>
      </div>

      {/* Categories */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1.5">
          {provider.service_categories?.map((category, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-full"
            >
              {category}
            </span>
          ))}
        </div>
      </div>

      {/* Stats - Mobile optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4 text-sm space-y-2 sm:space-y-0">
        <div className="flex items-center text-muted-foreground">
          <Icon name="Star" size={14} className="mr-1 text-yellow-500 flex-shrink-0" />
          <span className="truncate">{provider.rating || 0} ({provider.total_reviews || 0} reviews)</span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <Icon name="Package" size={14} className="mr-1 flex-shrink-0" />
          <span>{provider.services_count || 0} services</span>
        </div>
      </div>

      {/* Description */}
      {provider.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {provider.description}
        </p>
      )}

      {/* Actions - Mobile optimized buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewProfile(provider)}
          className="flex-1 text-sm px-3 py-2 h-9"
        >
          <Icon name="Eye" size={14} className="mr-1" />
          <span className="truncate">View Profile</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            // Add to favorites using context (saves to database)
            const alreadyFavorite = isFavorite(provider.id);
            
            if (!alreadyFavorite) {
              const success = await addToFavorites(provider.id);
              if (success) {
                alert('✅ Added to favorites! Redirecting to Favorites...');
                // Navigate to favorites tab in dashboard
                navigate('/traveler-dashboard?tab=favorites');
              } else {
                // Fallback to localStorage if API fails
                const favorites = JSON.parse(localStorage.getItem('favorite_providers') || '[]');
                const newFavorite = {
                  id: provider.id,
                  business_name: provider.business_name,
                  location: provider.location,
                  service_categories: provider.service_categories,
                  badge_type: provider.badge_type,
                  rating: provider.rating,
                  total_reviews: provider.total_reviews,
                  services_count: provider.services_count
                };
                favorites.push(newFavorite);
                localStorage.setItem('favorite_providers', JSON.stringify(favorites));
                alert('✅ Added to favorites! Redirecting to Favorites...');
                navigate('/traveler-dashboard?tab=favorites');
              }
            } else {
              alert('Already in favorites! Redirecting to Favorites...');
              navigate('/traveler-dashboard?tab=favorites');
            }
          }}
          className={`flex-1 text-sm px-3 py-2 h-9 ${isFavorite(provider.id) ? 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100' : 'text-red-500 hover:bg-red-50 border-red-200'}`}
        >
          <Icon name={isFavorite(provider.id) ? "HeartOff" : "Heart"} size={14} className="mr-1 flex-shrink-0" />
          <span className="truncate">{isFavorite(provider.id) ? 'In Favorites' : 'Add to Favorite'}</span>
        </Button>
      </div>
    </div>
  );
};

export default ProviderCard;
