import React, { useState } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';

const MultiTripModal = ({ isOpen, onClose, onConfirm }) => {
  const [tripCount, setTripCount] = useState(2);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(tripCount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="Route" size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Multiple Destinations</h3>
              <p className="text-sm text-muted-foreground">Plan a multi-stop journey</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              How many destinations do you want to visit?
            </p>
            
            {/* Trip Count Selector */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setTripCount(Math.max(2, tripCount - 1))}
                disabled={tripCount <= 2}
                className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="Minus" size={20} className="text-foreground" />
              </button>
              
              <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">{tripCount}</span>
              </div>
              
              <button
                onClick={() => setTripCount(Math.min(4, tripCount + 1))}
                disabled={tripCount >= 4}
                className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="Plus" size={20} className="text-foreground" />
              </button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              Minimum: 2 • Maximum: 4 destinations
            </p>
          </div>

          {/* Visual representation */}
          <div className="flex items-center justify-center gap-2 py-4">
            {Array.from({ length: tripCount }).map((_, index) => (
              <React.Fragment key={index}>
                <div className={`flex flex-col items-center ${index === 0 ? 'text-green-500' : index === tripCount - 1 ? 'text-red-500' : 'text-primary'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-green-100 dark:bg-green-900/30' : 
                    index === tripCount - 1 ? 'bg-red-100 dark:bg-red-900/30' : 
                    'bg-primary/10'
                  }`}>
                    <Icon 
                      name={index === 0 ? 'Play' : index === tripCount - 1 ? 'Flag' : 'MapPin'} 
                      size={16} 
                    />
                  </div>
                  <span className="text-xs mt-1 font-medium">
                    {index === 0 ? 'Start' : index === tripCount - 1 ? 'End' : `Stop ${index}`}
                  </span>
                </div>
                {index < tripCount - 1 && (
                  <div className="w-8 h-0.5 bg-border mt-[-12px]" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={18} className="text-primary mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">How it works:</p>
                <ul className="space-y-1">
                  <li>• First location is your starting point</li>
                  <li>• Last location is your ending point</li>
                  <li>• Select services from all destinations</li>
                  <li>• View all providers in one summary</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleConfirm}>
            <Icon name="Check" size={16} />
            Confirm {tripCount} Destinations
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MultiTripModal;
