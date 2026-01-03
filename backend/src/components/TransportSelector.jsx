import React, { useState, useEffect } from 'react';
import Icon from './AppIcon';
import { getTransportByRegion } from '../data/accommodationData';

const TransportSelector = ({ region, selectedType, onSelect, selectedTransport }) => {
  const [transports, setTransports] = useState([]);

  useEffect(() => {
    if (region) {
      const available = getTransportByRegion(region);
      if (selectedType) {
        setTransports(available.filter(t => t.type === selectedType));
      } else {
        setTransports(available);
      }
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

  if (transports.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Icon name="Car" size={48} className="mx-auto mb-3 opacity-50" />
        <p>No transport services available in {region}</p>
      </div>
    );
  }

  const getTransportIcon = (type) => {
    switch(type) {
      case 'rental-car': return 'Car';
      case 'private-driver': return 'Users';
      case 'bus': return 'Bus';
      case 'flight': return 'Plane';
      case 'train': return 'Train';
      case 'ferry': return 'Ship';
      default: return 'Car';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Available Transport Services in {region}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {transports.map(transport => (
          <div
            key={transport.id}
            onClick={() => onSelect(transport)}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedTransport?.id === transport.id
                ? 'border-primary bg-primary/10 shadow-md'
                : 'border-border hover:border-primary/50 hover:shadow'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-start space-x-3 flex-1">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name={getTransportIcon(transport.type)} size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{transport.name}</h4>
                  <p className="text-sm text-muted-foreground capitalize">{transport.type.replace('-', ' ')}</p>
                </div>
              </div>
              {selectedTransport?.id === transport.id && (
                <Icon name="CheckCircle" size={20} className="text-primary" />
              )}
            </div>

            {transport.vehicles && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-1">Available Vehicles:</p>
                <div className="flex flex-wrap gap-1">
                  {transport.vehicles.map((vehicle, idx) => (
                    <span key={idx} className="px-2 py-1 bg-muted text-xs rounded-full">
                      {vehicle}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {transport.routes && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-1">Routes:</p>
                <div className="flex flex-wrap gap-1">
                  {transport.routes.map((route, idx) => (
                    <span key={idx} className="px-2 py-1 bg-muted text-xs rounded-full">
                      {route}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div>
                <div className="text-xl font-bold text-primary">${transport.pricePerDay}</div>
                <div className="text-xs text-muted-foreground">per day</div>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Icon
                    key={i}
                    name="Star"
                    size={14}
                    className={i < Math.floor(transport.rating) ? 'text-yellow-500' : 'text-gray-300'}
                    fill={i < Math.floor(transport.rating) ? 'currentColor' : 'none'}
                  />
                ))}
                <span className="text-sm ml-1">{transport.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransportSelector;
