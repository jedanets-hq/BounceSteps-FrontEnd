import React, { useState, useEffect } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import { getAccommodationsByType } from '../data/accommodationData';

const AccommodationSelector = ({ region, selectedType, onSelect, selectedAccommodation }) => {
  const [accommodations, setAccommodations] = useState([]);

  useEffect(() => {
    if (region && selectedType) {
      const available = getAccommodationsByType(region, selectedType);
      setAccommodations(available);
    }
  }, [region, selectedType]);

  if (!region) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Icon name="MapPin" size={48} className="mx-auto mb-3 opacity-50" />
        <p>Please select a region first</p>
      </div>
    );
  }

  if (!selectedType) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Icon name="Hotel" size={48} className="mx-auto mb-3 opacity-50" />
        <p>Please select accommodation type first</p>
      </div>
    );
  }

  if (accommodations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Icon name="SearchX" size={48} className="mx-auto mb-3 opacity-50" />
        <p>No {selectedType}s available in {region}</p>
        <p className="text-sm mt-2">Try selecting a different region or accommodation type</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Available {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}s in {region}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {accommodations.map(accommodation => (
          <div
            key={accommodation.id}
            onClick={() => onSelect(accommodation)}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedAccommodation?.id === accommodation.id
                ? 'border-primary bg-primary/10 shadow-md'
                : 'border-border hover:border-primary/50 hover:shadow'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{accommodation.name}</h4>
                <p className="text-sm text-muted-foreground flex items-center mt-1">
                  <Icon name="MapPin" size={14} className="mr-1" />
                  {accommodation.location}
                </p>
              </div>
              {selectedAccommodation?.id === accommodation.id && (
                <Icon name="CheckCircle" size={20} className="text-primary" />
              )}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div>
                <div className="text-xl font-bold text-primary">${accommodation.price}</div>
                <div className="text-xs text-muted-foreground">per night</div>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Icon
                    key={i}
                    name="Star"
                    size={14}
                    className={i < Math.floor(accommodation.rating) ? 'text-yellow-500' : 'text-gray-300'}
                    fill={i < Math.floor(accommodation.rating) ? 'currentColor' : 'none'}
                  />
                ))}
                <span className="text-sm ml-1">{accommodation.rating}</span>
              </div>
            </div>

            {accommodation.facilities && accommodation.facilities.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {accommodation.facilities.slice(0, 4).map((facility, idx) => (
                  <span key={idx} className="px-2 py-1 bg-muted text-xs rounded-full">
                    {facility}
                  </span>
                ))}
                {accommodation.facilities.length > 4 && (
                  <span className="px-2 py-1 bg-muted text-xs rounded-full">
                    +{accommodation.facilities.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccommodationSelector;
