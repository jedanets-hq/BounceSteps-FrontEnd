import React from 'react';
import Icon from '../../../components/AppIcon';

const ServiceTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'accommodation',
      name: 'Accommodation',
      icon: 'Building',
      description: 'Hotels & Stays'
    },
    {
      id: 'transportation',
      name: 'Transportation',
      icon: 'Car',
      description: 'Transfers & Rentals'
    },
    {
      id: 'food',
      name: 'Food & Dining',
      icon: 'Utensils',
      description: 'Restaurants & Cafes'
    },
    {
      id: 'tours',
      name: 'Tours & Activities',
      icon: 'Camera',
      description: 'Safaris & Tours'
    },
    {
      id: 'shopping',
      name: 'Shopping',
      icon: 'ShoppingBag',
      description: 'Markets & Crafts'
    },
    {
      id: 'health',
      name: 'Health & Wellness',
      icon: 'Heart',
      description: 'Spas & Fitness'
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      icon: 'Music',
      description: 'Nightlife & Events'
    }
  ];

  return (
    <div className="bg-background border-b border-border sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => onTabChange(tab?.id)}
              className={`flex-shrink-0 flex items-center space-x-3 px-6 py-4 border-b-2 transition-all duration-200 ${
                activeTab === tab?.id
                  ? 'border-primary text-primary bg-primary/5' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'
              }`}
            >
              <Icon name={tab?.icon} size={20} />
              <div className="text-left">
                <div className="font-medium text-sm">{tab?.name}</div>
                <div className="text-xs opacity-75">{tab?.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceTabs;