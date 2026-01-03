import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ExperienceBuilder = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Force component to auto-switch to create tab when mounted
  useEffect(() => {
    console.log('ExperienceBuilder mounted, setting to create tab');
    setActiveTab('create');
  }, []);

  const categories = [
    { id: 'adventure', name: 'Adventure & Outdoor', icon: 'Mountain' },
    { id: 'cultural', name: 'Cultural Heritage', icon: 'Landmark' },
    { id: 'luxury', name: 'Luxury Experiences', icon: 'Crown' },
    { id: 'culinary', name: 'Culinary Tours', icon: 'ChefHat' },
    { id: 'wellness', name: 'Wellness & Spa', icon: 'Heart' },
    { id: 'wildlife', name: 'Wildlife Safari', icon: 'Binoculars' }
  ];

  const existingExperiences = [
    {
      id: 1,
      title: "Exclusive Maasai Village Experience",
      category: "Cultural Heritage",
      price: 450,
      duration: "Full Day",
      status: "active",
      bookings: 23,
      rating: 4.9
    },
    {
      id: 2,
      title: "Private Safari with Conservation Expert",
      category: "Wildlife Safari",
      price: 850,
      duration: "2 Days",
      status: "active",
      bookings: 15,
      rating: 4.8
    },
    {
      id: 3,
      title: "Traditional Cooking Masterclass",
      category: "Culinary Tours",
      price: 180,
      duration: "Half Day",
      status: "draft",
      bookings: 0,
      rating: 0
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-success bg-success/10';
      case 'draft':
        return 'text-warning bg-warning/10';
      case 'paused':
        return 'text-muted-foreground bg-muted';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Experience Builder</h2>
          <p className="text-muted-foreground">Create unique packages exclusively for iSafari travelers</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab('create');
            }}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === 'create' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            Create New
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab('manage');
            }}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === 'manage' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            Manage Existing
          </button>
        </div>
      </div>
      {activeTab === 'create' && (
        <div className="space-y-6">
          {/* Category Selection */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Select Experience Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories?.map((category) => (
                <button
                  key={category?.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedCategory(category?.id);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedCategory === category?.id
                      ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${selectedCategory === category?.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      <Icon name={category?.icon} size={20} />
                    </div>
                    <span className="font-medium text-foreground">{category?.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedCategory && (
            <div className="space-y-6 pt-6 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Experience Title"
                  placeholder="Enter a compelling title"
                  required
                />
                <Input
                  label="Duration"
                  placeholder="e.g., Half Day, Full Day, 2 Days"
                  required
                />
                <Input
                  label="Price per Person (USD)"
                  type="number"
                  placeholder="0"
                  required
                />
                <Input
                  label="Maximum Group Size"
                  type="number"
                  placeholder="8"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Experience Description
                </label>
                <textarea
                  className="w-full h-32 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Describe what makes this experience unique and exclusive..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  What's Included
                </label>
                <div className="space-y-2">
                  <Input placeholder="e.g., Professional guide" />
                  <Input placeholder="e.g., Transportation" />
                  <Input placeholder="e.g., Traditional meal" />
                  <Button variant="outline" size="sm" onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    alert('Adding new item...');
                  }}>
                    <Icon name="Plus" size={16} />
                    Add Item
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border">
                <Button variant="outline" onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  alert('Saving as draft...');
                }}>
                  Save as Draft
                </Button>
                <Button variant="default" onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  alert('Submitting for review...');
                }}>
                  <Icon name="Send" size={16} />
                  Submit for Review
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      {activeTab === 'manage' && (
        <div className="space-y-4">
          {existingExperiences?.map((experience) => (
            <div key={experience?.id} className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-foreground">{experience?.title}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(experience?.status)}`}>
                      {experience?.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <span>{experience?.category}</span>
                    <span>${experience?.price}/person</span>
                    <span>{experience?.duration}</span>
                    <span>{experience?.bookings} bookings</span>
                    {experience?.rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <Icon name="Star" size={14} className="text-warning fill-current" />
                        <span>{experience?.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    alert(`Editing ${experience?.title}...`);
                  }}>
                    <Icon name="Edit" size={16} />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    alert(`Opening analytics for ${experience?.title}...`);
                  }}>
                    <Icon name="BarChart" size={16} />
                    Analytics
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperienceBuilder;