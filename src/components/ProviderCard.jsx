import React from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import VerifiedBadge from './ui/VerifiedBadge';

const ProviderCard = ({ provider, onViewProfile, onSelect, isSelected }) => {
  return (
    <div className={`bg-card border rounded-lg p-6 transition-all hover:shadow-lg ${
      isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          {provider.avatar_url ? (
            <img
              src={provider.avatar_url}
              alt={provider.business_name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="Briefcase" size={24} className="text-primary" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-foreground">{provider.business_name}</h3>
              {provider.is_verified && <VerifiedBadge size="sm" />}
            </div>
            <p className="text-sm text-muted-foreground">{provider.business_type}</p>
            {provider.is_premium && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                <Icon name="Star" size={12} className="mr-1" />
                Premium
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center text-sm text-muted-foreground mb-3">
        <Icon name="MapPin" size={16} className="mr-2" />
        <span>{provider.location}</span>
      </div>

      {/* Categories */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {provider.service_categories?.map((category, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-secondary/10 text-secondary text-xs rounded-full"
            >
              {category}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center space-x-4 mb-4 text-sm">
        <div className="flex items-center text-muted-foreground">
          <Icon name="Star" size={16} className="mr-1 text-yellow-500" />
          <span>{provider.rating || 0} ({provider.total_reviews || 0} reviews)</span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <Icon name="Package" size={16} className="mr-1" />
          <span>{provider.services_count || 0} services</span>
        </div>
      </div>

      {/* Description */}
      {provider.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {provider.description}
        </p>
      )}

      {/* Actions */}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewProfile(provider)}
          className="flex-1"
        >
          <Icon name="Eye" size={16} />
          View Profile
        </Button>
        <Button
          variant={isSelected ? 'default' : 'secondary'}
          size="sm"
          onClick={() => onSelect(provider)}
          className="flex-1"
        >
          <Icon name={isSelected ? 'Check' : 'Plus'} size={16} />
          {isSelected ? 'Selected' : 'Select'}
        </Button>
      </div>
    </div>
  );
};

export default ProviderCard;
