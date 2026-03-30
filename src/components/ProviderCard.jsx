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
    <div className={`rounded-xl bg-white/5 p-3 space-y-2 flex flex-col transition-all hover:shadow-lg sm:p-3 md:bg-card md:border md:rounded-lg md:p-6 md:transition-all md:hover:shadow-lg ${
      isSelected ? 'border-primary ring-2 ring-primary/20 sm:border-primary sm:ring-2 sm:ring-primary/20 md:border-primary md:ring-2 md:ring-primary/20' : 'md:border-border'
    }`}>
      <div className="flex items-start justify-between space-y-2 sm:space-y-2 md:mb-4">
        <div className="flex items-center space-x-3 sm:space-x-3 md:space-x-4">
          {provider.avatar_url ? (
            <img
              src={provider.avatar_url}
              alt={provider.business_name}
              className="w-12 h-12 rounded-full object-cover sm:w-12 sm:h-12 md:w-16 md:h-16"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center sm:w-12 sm:h-12 md:w-16 md:h-16">
              <Icon name="Briefcase" size={20} className="text-primary sm:size-20 md:size-24" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-foreground sm:text-sm md:font-semibold md:text-lg md:text-foreground">{provider.business_name}</h3>
              {/* Display badges from database (can be multiple) */}
              {provider.badges && provider.badges.length > 0 && (
                <div className="flex items-center gap-1">
                  {provider.badges.map((badge, index) => (
                    <ProviderBadge key={index} badgeType={badge.badge_type} size="sm" showText={false} />
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 sm:text-xs md:text-sm md:text-muted-foreground">{provider.business_type}</p>
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
      <div className="flex items-center text-xs text-gray-400 sm:text-xs md:text-sm md:text-muted-foreground md:mb-3">
        <Icon name="MapPin" size={14} className="mr-2 sm:size-14 md:size-16 md:mr-2" />
        <span>{provider.location}</span>
      </div>

      {/* Categories */}
      <div className="space-y-2 sm:space-y-2 md:mb-4">
        <div className="flex flex-wrap gap-2">
          {provider.service_categories?.map((category, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-full sm:px-2 sm:py-1 sm:text-xs md:px-3 md:py-1 md:text-xs"
            >
              {category}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center space-x-3 text-xs sm:space-x-3 sm:text-xs md:space-x-4 md:mb-4 md:text-sm">
        <div className="flex items-center text-gray-300 sm:text-gray-300 md:text-muted-foreground">
          <Icon name="Star" size={14} className="mr-1 text-yellow-500 sm:size-14 sm:mr-1 md:size-16 md:mr-1" />
          <span>{provider.rating || 0} ({provider.total_reviews || 0} reviews)</span>
        </div>
        <div className="flex items-center text-gray-300 sm:text-gray-300 md:text-muted-foreground">
          <Icon name="Package" size={14} className="mr-1 sm:size-14 sm:mr-1 md:size-16 md:mr-1" />
          <span>{provider.services_count || 0} services</span>
        </div>
      </div>

      {/* Description */}
      {provider.description && (
        <p className="text-xs text-gray-400 line-clamp-2 sm:text-xs sm:line-clamp-2 md:text-sm md:text-muted-foreground md:mb-4 md:line-clamp-2">
          {provider.description}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-3 sm:gap-2 sm:mt-3 md:space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewProfile(provider)}
          className="flex-1 py-2 px-4 text-sm rounded-lg sm:flex-1 sm:py-2 sm:px-4 sm:text-sm sm:rounded-lg md:flex-1"
        >
          <Icon name="Eye" size={16} />
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
          className={`flex-1 py-2 px-4 text-sm rounded-lg sm:flex-1 sm:py-2 sm:px-4 sm:text-sm sm:rounded-lg md:flex-1 ${isFavorite(provider.id) ? 'text-red-600 bg-red-50 sm:text-red-600 sm:bg-red-50 md:text-red-600 md:bg-red-50' : 'text-red-500 hover:bg-red-50 sm:text-red-500 sm:hover:bg-red-50 md:text-red-500 md:hover:bg-red-50'}`}
        >
          <Icon name={isFavorite(provider.id) ? "HeartOff" : "Heart"} size={16} />
          {isFavorite(provider.id) ? 'In Favorites' : 'Add to Favorite'}
        </Button>
      </div>
    </div>
  );
};

export default ProviderCard;
