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
    <div className={`rounded-xl bg-white/5 p-3 space-y-2 flex flex-col md:bg-card md:border md:rounded-lg md:p-6 md:transition-all md:hover:shadow-lg ${
      isSelected ? 'border-primary ring-2 ring-primary/20 md:border-primary md:ring-2 md:ring-primary/20' : 'md:border-border'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 md:space-x-4">
          {provider.avatar_url ? (
            <img
              src={provider.avatar_url}
              alt={provider.business_name}
              className="w-12 h-12 rounded-full object-cover md:w-16 md:h-16"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center md:w-16 md:h-16">
              <Icon name="Briefcase" size={20} className="text-primary md:size-24" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold line-clamp-2 md:text-lg md:text-foreground">{provider.business_name}</h3>
              {/* Display badges from database (can be multiple) */}
              {provider.badges && provider.badges.length > 0 && (
                <div className="flex items-center gap-1">
                  {provider.badges.map((badge, index) => (
                    <ProviderBadge key={index} badgeType={badge.badge_type} size="xs" showText={false} className="md:size-sm" />
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 md:text-sm md:text-muted-foreground">{provider.business_type}</p>
            {/* Show badges with text below name */}
            {provider.badges && provider.badges.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {provider.badges.map((badge, index) => (
                  <ProviderBadge key={index} badgeType={badge.badge_type} size="xs" showText={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center text-xs text-gray-400 md:text-sm md:text-muted-foreground">
        <Icon name="MapPin" size={12} className="mr-1 md:size-16 md:mr-2" />
        <span className="line-clamp-1">{provider.location}</span>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-1 md:gap-2">
        {provider.service_categories?.map((category, index) => (
          <span
            key={index}
            className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full md:px-3 md:py-1"
          >
            {category}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center text-xs md:flex md:items-center md:space-x-4 md:text-sm">
        <div className="flex items-center text-gray-300 md:text-muted-foreground">
          <Icon name="Star" size={12} className="mr-1 text-yellow-500 md:size-16" />
          <span>{provider.rating || 0} ({provider.total_reviews || 0})</span>
        </div>
        <div className="flex items-center text-gray-300 md:text-muted-foreground">
          <Icon name="Package" size={12} className="mr-1 md:size-16" />
          <span>{provider.services_count || 0} services</span>
        </div>
      </div>

      {/* Description */}
      {provider.description && (
        <p className="text-xs text-gray-400 line-clamp-2 md:text-sm md:text-muted-foreground">
          {provider.description}
        </p>
      )}

      {/* Actions */}
      <div className="flex space-x-2 mt-3 md:space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewProfile(provider)}
          className="flex-1 text-xs py-2 h-auto md:text-sm"
        >
          <Icon name="Eye" size={12} className="mr-1 md:size-16" />
          View Profile
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
          className={`flex-1 text-xs py-2 h-auto md:text-sm ${isFavorite(provider.id) ? 'text-red-600 bg-red-50' : 'text-red-500 hover:bg-red-50'}`}
        >
          <Icon name={isFavorite(provider.id) ? "HeartOff" : "Heart"} size={12} className="mr-1 md:size-16" />
          {isFavorite(provider.id) ? 'In Favorites' : 'Add to Favorite'}
        </Button>
      </div>
    </div>
  );
};

export default ProviderCard;
