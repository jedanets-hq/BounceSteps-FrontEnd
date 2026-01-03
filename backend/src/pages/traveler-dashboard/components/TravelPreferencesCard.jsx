import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TravelPreferencesCard = ({ preferences }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
            <Icon name="Settings" size={20} className="text-secondary" />
          </div>
          <div>
            <h3 className="font-display text-lg font-medium">Travel Preferences</h3>
            <p className="text-sm text-muted-foreground">Personalized based on your journey history</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isEditing) {
              // Save preferences logic
              const updatedPreferences = {
                accommodation: preferences.accommodation,
                transportation: preferences.transportation,
                destinations: preferences.destinations,
                activities: preferences.activities,
                budgetRange: preferences.budgetRange
              };
              localStorage.setItem('travel_preferences', JSON.stringify(updatedPreferences));
              alert('Preferences saved successfully!');
              setIsEditing(false);
            } else {
              setIsEditing(true);
            }
          }}
        >
          <Icon name="Edit" size={16} />
          {isEditing ? 'Save' : 'Edit'}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-3">Accommodation</h4>
            <div className="space-y-2">
              {preferences?.accommodation?.map((pref, index) => (
                <div key={`accommodation-${pref.type || index}`} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{pref?.type}</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[...Array(5)]?.map((_, i) => (
                        <Icon 
                          key={i}
                          name="Star" 
                          size={12} 
                          className={i < pref?.rating ? 'text-warning fill-current' : 'text-muted-foreground/30'} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">({pref?.count})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-3">Transportation</h4>
            <div className="space-y-2">
              {preferences?.transportation?.map((pref, index) => (
                <div key={`transportation-${pref.type || index}`} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name={pref?.icon} size={16} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{pref?.type}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{pref?.preference}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-3">Destinations</h4>
            <div className="flex flex-wrap gap-2">
              {preferences?.destinations?.map((dest, index) => (
                <span 
                  key={`destination-${dest || index}`}
                  className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full"
                >
                  {dest}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-3">Activities</h4>
            <div className="space-y-2">
              {preferences?.activities?.map((activity, index) => (
                <div key={`activity-${activity.name || index}`} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{activity?.name}</span>
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div 
                      className="bg-accent h-2 rounded-full"
                      style={{ width: `${activity?.interest}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-3">Budget Range</h4>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>$500</span>
                  <span>$5000+</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-secondary h-2 rounded-full"
                    style={{ width: '70%' }}
                  ></div>
                </div>
              </div>
              <span className="text-sm font-medium text-foreground">{preferences?.budgetRange}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelPreferencesCard;