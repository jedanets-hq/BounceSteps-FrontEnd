import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const InteractiveWorldMap = () => {
  const [hoveredDestination, setHoveredDestination] = useState(null);

  const trendingDestinations = [
    {
      id: 1,
      name: "Bali, Indonesia",
      position: { top: '65%', left: '75%' },
      image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      experience: "Temple hopping & rice terrace trekking",
      price: "From $1,899",
      trending: "🔥 Trending",
      bookings: "127 bookings this week"
    },
    {
      id: 2,
      name: "Santorini, Greece",
      position: { top: '45%', left: '52%' },
      image: "https://images.pexels.com/photos/161815/santorini-oia-greece-water-161815.jpeg?auto=compress&cs=tinysrgb&w=800",
      experience: "Sunset wine tours & volcanic exploration",
      price: "From $2,299",
      trending: "⭐ Popular",
      bookings: "89 bookings this week"
    },
    {
      id: 3,
      name: "Machu Picchu, Peru",
      position: { top: '70%', left: '25%' },
      image: "https://images.pixabay.com/photo/2019/07/28/07/07/machu-picchu-4366641_1280.jpg",
      experience: "Ancient Inca trail & cultural immersion",
      price: "From $2,799",
      trending: "🌟 Exclusive",
      bookings: "45 bookings this week"
    },
    {
      id: 4,
      name: "Dubai, UAE",
      position: { top: '55%', left: '60%' },
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      experience: "Desert safaris & luxury experiences",
      price: "From $1,599",
      trending: "💎 Luxury",
      bookings: "156 bookings this week"
    },
    {
      id: 5,
      name: "Tokyo, Japan",
      position: { top: '40%', left: '85%' },
      image: "https://images.pexels.com/photos/2070033/pexels-photo-2070033.jpeg?auto=compress&cs=tinysrgb&w=800",
      experience: "Cherry blossoms & cultural workshops",
      price: "From $3,199",
      trending: "🌸 Seasonal",
      bookings: "203 bookings this week"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-display font-medium text-foreground mb-6">
            Discover Trending Destinations
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our interactive world map to discover trending destinations and unique experiences 
            curated by our local partners around the globe.
          </p>
        </div>

        <div className="relative">
          {/* World Map Container */}
          <div className="relative w-full h-96 lg:h-[500px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl overflow-hidden border border-border shadow-lg">
            {/* Simplified World Map SVG Background */}
            <div className="absolute inset-0 opacity-20">
              <svg viewBox="0 0 1000 500" className="w-full h-full">
                <path
                  d="M150,200 Q200,150 300,180 T500,200 Q600,220 700,200 T900,180"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.3"
                />
                <path
                  d="M100,300 Q200,280 350,300 T600,320 Q750,340 850,320"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.3"
                />
              </svg>
            </div>

            {/* Destination Markers */}
            {trendingDestinations?.map((destination) => (
              <div
                key={destination?.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={destination?.position}
                onMouseEnter={() => setHoveredDestination(destination)}
                onMouseLeave={() => setHoveredDestination(null)}
                onClick={() => window.location.href = '/destination-discovery?search=' + encodeURIComponent(destination?.name)}
              >
                {/* Pulsing Marker */}
                <div className="relative">
                  <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-4 h-4 bg-primary/30 rounded-full animate-ping"></div>
                </div>

                {/* Hover Preview Card */}
                {hoveredDestination?.id === destination?.id && (
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-80 bg-card border border-border rounded-xl shadow-xl p-4 z-10">
                    <div className="flex items-start space-x-3">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={destination?.image}
                          alt={destination?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-card-foreground text-sm truncate">
                            {destination?.name}
                          </h4>
                          <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">
                            {destination?.trending}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {destination?.experience}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-primary">
                            {destination?.price}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {destination?.bookings}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Map Legend */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
              <span>Trending Destinations</span>
            </div>
            <div className="flex items-center">
              <Icon name="TrendingUp" size={16} className="mr-2 text-accent" />
              <span>High Demand</span>
            </div>
            <div className="flex items-center">
              <Icon name="Users" size={16} className="mr-2 text-secondary" />
              <span>Local Partnerships</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">150+</div>
            <div className="text-sm text-muted-foreground">Destinations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">50K+</div>
            <div className="text-sm text-muted-foreground">Happy Travelers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">1000+</div>
            <div className="text-sm text-muted-foreground">Local Partners</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Concierge Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveWorldMap;