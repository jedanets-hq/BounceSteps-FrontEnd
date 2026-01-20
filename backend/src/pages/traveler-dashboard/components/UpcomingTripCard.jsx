import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const UpcomingTripCard = ({ trip, onViewDetails }) => {
  const getDaysUntilTrip = (departureDate) => {
    const today = new Date();
    const departure = new Date(departureDate);
    const diffTime = departure - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntilTrip(trip?.departureDate);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="relative h-48">
        <Image
          src={trip?.image}
          alt={trip?.destination}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
          {daysUntil > 0 ? `${daysUntil} days` : 'Today'}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="text-white font-display text-xl font-medium">{trip?.destination}</h3>
          <p className="text-white/90 text-sm">{trip?.duration}</p>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Icon name="Calendar" size={16} />
            <span className="text-sm">{trip?.dateRange}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${trip?.status === 'confirmed' ? 'bg-success' : 'bg-warning'}`}></div>
            <span className="text-sm capitalize text-muted-foreground">{trip?.status}</span>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Weather</span>
            <div className="flex items-center space-x-2">
              <Icon name="Sun" size={16} className="text-warning" />
              <span>{trip?.weather}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Checklist</span>
            <span className="text-foreground">{trip?.checklistCompleted}/{trip?.checklistTotal} completed</span>
          </div>
          
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(trip?.checklistCompleted / trip?.checklistTotal) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onViewDetails) {
                onViewDetails(trip);
              } else {
                alert('Trip details feature will be implemented');
              }
            }}
          >
            <Icon name="FileText" size={16} />
            View Details
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              alert('Travel checklist feature will be implemented');
            }}
          >
            <Icon name="CheckSquare" size={16} />
            Checklist
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpcomingTripCard;