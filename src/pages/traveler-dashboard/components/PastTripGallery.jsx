import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const PastTripGallery = ({ trips }) => {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
            <Icon name="Camera" size={20} className="text-accent" />
          </div>
          <div>
            <h3 className="font-display text-lg font-medium">Travel Memories</h3>
            <p className="text-sm text-muted-foreground">{trips?.length} amazing journeys completed</p>
          </div>
        </div>
        <Button variant="outline" size="sm" type="button" onClick={() => {
          navigate('/profile?tab=stories&action=create');
        }}>
          <Icon name="Plus" size={16} />
          Create Story
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {trips?.map((trip) => (
          <div 
            key={trip?.id}
            className="group cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedTrip(trip);
            }}
          >
            <div className="relative rounded-lg overflow-hidden aspect-square">
              <Image
                src={trip?.coverImage}
                alt={trip?.destination}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h4 className="text-white font-medium">{trip?.destination}</h4>
                  <p className="text-white/80 text-sm">{trip?.date}</p>
                </div>
              </div>
              <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                {trip?.photoCount} photos
              </div>
            </div>
            
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">{trip?.destination}</h4>
                <div className="flex items-center space-x-1">
                  {[...Array(5)]?.map((_, i) => (
                    <Icon 
                      key={i}
                      name="Star" 
                      size={12} 
                      className={i < trip?.rating ? 'text-warning fill-current' : 'text-muted-foreground/30'} 
                    />
                  ))}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2">{trip?.highlights}</p>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Icon name="Heart" size={12} />
                    <span>{trip?.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="MessageCircle" size={12} />
                    <span>{trip?.comments}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  alert('Share functionality will be implemented');
                }}>
                  <Icon name="Share2" size={12} />
                  Share
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {trips?.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Camera" size={24} className="text-muted-foreground" />
          </div>
          <h4 className="font-medium text-foreground mb-2">No travel memories yet</h4>
          <p className="text-sm text-muted-foreground mb-4">Start your first journey to create amazing memories</p>
          <Button variant="default" type="button" onClick={() => {
            navigate('/journey-planner');
          }}>
            <Icon name="Plus" size={16} />
            Plan Your First Trip
          </Button>
        </div>
      )}
    </div>
  );
};

export default PastTripGallery;