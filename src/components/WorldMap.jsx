import React, { useState } from 'react';
import Icon from './AppIcon';

const WorldMap = ({ destinations = [], onDestinationClick }) => {
  const [hoveredDestination, setHoveredDestination] = useState(null);

  // World map destinations with coordinates
  const worldDestinations = [
    { id: 1, name: 'Santorini, Greece', lat: 36.4, lng: 25.4, category: 'beach', price: '$2,299' },
    { id: 2, name: 'Kyoto, Japan', lat: 35.0, lng: 135.8, category: 'culture', price: '$3,599' },
    { id: 3, name: 'Patagonia, Chile', lat: -50.0, lng: -73.0, category: 'adventure', price: '$4,199' },
    { id: 4, name: 'Bali, Indonesia', lat: -8.3, lng: 115.1, category: 'beach', price: '$1,899' },
    { id: 5, name: 'New York, USA', lat: 40.7, lng: -74.0, category: 'city', price: '$2,799' },
    { id: 6, name: 'Swiss Alps, Switzerland', lat: 46.5, lng: 8.0, category: 'nature', price: '$3,999' },
    { id: 7, name: 'Serengeti, Tanzania', lat: -2.3, lng: 34.8, category: 'adventure', price: '$3,299' },
    { id: 8, name: 'Machu Picchu, Peru', lat: -13.2, lng: -72.5, category: 'culture', price: '$2,899' },
    { id: 9, name: 'Maldives', lat: 3.2, lng: 73.2, category: 'beach', price: '$4,599' },
    { id: 10, name: 'Dubai, UAE', lat: 25.2, lng: 55.3, category: 'city', price: '$2,199' },
    { id: 11, name: 'Iceland', lat: 64.1, lng: -21.9, category: 'nature', price: '$3,799' },
    { id: 12, name: 'Morocco', lat: 31.8, lng: -7.1, category: 'culture', price: '$2,499' }
  ];

  // Convert lat/lng to SVG coordinates
  const latLngToSvg = (lat, lng) => {
    const x = ((lng + 180) / 360) * 800;
    const y = ((90 - lat) / 180) * 400;
    return { x, y };
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'beach': return '#3B82F6';
      case 'culture': return '#8B5CF6';
      case 'adventure': return '#EF4444';
      case 'city': return '#F59E0B';
      case 'nature': return '#10B981';
      default: return '#6B7280';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-foreground">Trending Destinations Worldwide</h3>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Beach</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Culture</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Adventure</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>City</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Nature</span>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <svg viewBox="0 0 800 400" className="w-full h-auto border border-border rounded-lg bg-slate-50">
          {/* World Map Outline */}
          <g fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="0.5">
            {/* Simplified world map paths */}
            {/* North America */}
            <path d="M 150 80 L 250 70 L 280 90 L 300 120 L 280 140 L 250 130 L 200 140 L 150 120 Z" />
            <path d="M 200 140 L 280 140 L 300 160 L 280 180 L 250 170 L 200 180 Z" />
            
            {/* South America */}
            <path d="M 220 200 L 280 190 L 300 220 L 290 280 L 270 320 L 250 300 L 230 280 L 220 240 Z" />
            
            {/* Europe */}
            <path d="M 380 60 L 420 50 L 450 70 L 440 90 L 420 100 L 380 90 Z" />
            
            {/* Africa */}
            <path d="M 380 120 L 450 110 L 480 140 L 470 200 L 450 260 L 420 280 L 400 260 L 390 200 L 380 160 Z" />
            
            {/* Asia */}
            <path d="M 450 50 L 600 40 L 650 60 L 680 80 L 700 100 L 680 120 L 650 110 L 600 120 L 550 110 L 500 100 L 450 90 Z" />
            <path d="M 500 120 L 600 110 L 650 130 L 680 150 L 650 180 L 600 170 L 550 180 L 500 160 Z" />
            
            {/* Australia */}
            <path d="M 600 280 L 680 270 L 700 290 L 680 310 L 640 320 L 600 310 Z" />
          </g>
          
          {/* Destination Markers */}
          {worldDestinations.map((destination) => {
            const { x, y } = latLngToSvg(destination.lat, destination.lng);
            const isHovered = hoveredDestination === destination.id;
            
            return (
              <g key={destination.id}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 8 : 6}
                  fill={getCategoryColor(destination.category)}
                  stroke="white"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200 hover:scale-125"
                  onMouseEnter={() => setHoveredDestination(destination.id)}
                  onMouseLeave={() => setHoveredDestination(null)}
                  onClick={() => onDestinationClick && onDestinationClick(destination)}
                />
                
                {/* Destination Label */}
                {isHovered && (
                  <g>
                    <rect
                      x={x - 60}
                      y={y - 35}
                      width="120"
                      height="25"
                      fill="white"
                      stroke="#D1D5DB"
                      strokeWidth="1"
                      rx="4"
                      className="shadow-lg"
                    />
                    <text
                      x={x}
                      y={y - 20}
                      textAnchor="middle"
                      className="text-xs font-medium fill-gray-800"
                    >
                      {destination.name}
                    </text>
                    <text
                      x={x}
                      y={y - 8}
                      textAnchor="middle"
                      className="text-xs fill-gray-600"
                    >
                      {destination.price}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
        
        {/* Interactive Info Panel */}
        {hoveredDestination && (
          <div className="absolute top-4 right-4 bg-white border border-border rounded-lg p-4 shadow-lg max-w-xs">
            {(() => {
              const dest = worldDestinations.find(d => d.id === hoveredDestination);
              return (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{dest.name}</h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{dest.category}</span>
                    <span className="font-medium text-primary">{dest.price}</span>
                  </div>
                  <button 
                    onClick={() => onDestinationClick && onDestinationClick(dest)}
                    className="mt-2 w-full bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary/90 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              );
            })()}
          </div>
        )}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Click on any destination marker to explore packages and book your next adventure
        </p>
      </div>
    </div>
  );
};

export default WorldMap;
