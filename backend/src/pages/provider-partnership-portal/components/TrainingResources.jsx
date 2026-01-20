import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TrainingResources = () => {
  const [activeCategory, setActiveCategory] = useState('standards');
  const [completedModules, setCompletedModules] = useState(['cultural-sensitivity-1', 'emergency-protocols-1']);

  const trainingCategories = [
    { id: 'standards', name: 'Service Standards', icon: 'Award' },
    { id: 'cultural', name: 'Cultural Sensitivity', icon: 'Globe' },
    { id: 'emergency', name: 'Emergency Protocols', icon: 'Shield' },
    { id: 'sustainability', name: 'Sustainable Tourism', icon: 'Leaf' },
    { id: 'technology', name: 'Platform Training', icon: 'Monitor' }
  ];

  const trainingModules = {
    standards: [
      {
        id: 'luxury-service-1',
        title: 'Luxury Service Excellence',
        description: 'Understanding iSafari\'s premium service expectations and delivery standards',
        duration: '45 min',
        type: 'video',
        difficulty: 'intermediate',
        completed: false
      },
      {
        id: 'quality-assurance-1',
        title: 'Quality Assurance Best Practices',
        description: 'Maintaining consistent quality across all traveler interactions',
        duration: '30 min',
        type: 'interactive',
        difficulty: 'beginner',
        completed: false
      },
      {
        id: 'feedback-management-1',
        title: 'Handling Traveler Feedback',
        description: 'Professional approaches to receiving and acting on traveler feedback',
        duration: '25 min',
        type: 'case-study',
        difficulty: 'intermediate',
        completed: false
      }
    ],
    cultural: [
      {
        id: 'cultural-sensitivity-1',
        title: 'Cultural Sensitivity Fundamentals',
        description: 'Respecting diverse cultural backgrounds and creating inclusive experiences',
        duration: '40 min',
        type: 'video',
        difficulty: 'beginner',
        completed: true
      },
      {
        id: 'local-customs-1',
        title: 'Local Customs and Traditions',
        description: 'Understanding and sharing local cultural practices respectfully',
        duration: '35 min',
        type: 'interactive',
        difficulty: 'intermediate',
        completed: false
      },
      {
        id: 'cross-cultural-communication-1',
        title: 'Cross-Cultural Communication',
        description: 'Effective communication strategies for international travelers',
        duration: '50 min',
        type: 'workshop',
        difficulty: 'advanced',
        completed: false
      }
    ],
    emergency: [
      {
        id: 'emergency-protocols-1',
        title: 'Emergency Response Protocols',
        description: 'Essential emergency procedures and contact protocols',
        duration: '60 min',
        type: 'certification',
        difficulty: 'intermediate',
        completed: true
      },
      {
        id: 'medical-emergencies-1',
        title: 'Medical Emergency Management',
        description: 'Handling medical situations and coordinating with healthcare providers',
        duration: '45 min',
        type: 'video',
        difficulty: 'advanced',
        completed: false
      },
      {
        id: 'evacuation-procedures-1',
        title: 'Evacuation and Safety Procedures',
        description: 'Emergency evacuation protocols and traveler safety measures',
        duration: '40 min',
        type: 'simulation',
        difficulty: 'advanced',
        completed: false
      }
    ],
    sustainability: [
      {
        id: 'sustainable-practices-1',
        title: 'Sustainable Tourism Practices',
        description: 'Implementing eco-friendly and community-beneficial tourism practices',
        duration: '55 min',
        type: 'interactive',
        difficulty: 'intermediate',
        completed: false
      },
      {
        id: 'community-impact-1',
        title: 'Community Impact Assessment',
        description: 'Understanding and maximizing positive community impacts',
        duration: '40 min',
        type: 'case-study',
        difficulty: 'intermediate',
        completed: false
      }
    ],
    technology: [
      {
        id: 'platform-basics-1',
        title: 'iSafari Platform Basics',
        description: 'Navigating the partner portal and managing bookings effectively',
        duration: '30 min',
        type: 'tutorial',
        difficulty: 'beginner',
        completed: false
      },
      {
        id: 'booking-management-1',
        title: 'Advanced Booking Management',
        description: 'Managing complex bookings, modifications, and cancellations',
        duration: '45 min',
        type: 'interactive',
        difficulty: 'intermediate',
        completed: false
      }
    ]
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-success bg-success/10';
      case 'intermediate':
        return 'text-warning bg-warning/10';
      case 'advanced':
        return 'text-error bg-error/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return 'Play';
      case 'interactive':
        return 'MousePointer';
      case 'case-study':
        return 'FileText';
      case 'workshop':
        return 'Users';
      case 'certification':
        return 'Award';
      case 'simulation':
        return 'Zap';
      case 'tutorial':
        return 'BookOpen';
      default:
        return 'Book';
    }
  };

  const toggleModuleCompletion = (moduleId) => {
    setCompletedModules(prev => 
      prev?.includes(moduleId) 
        ? prev?.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const currentModules = trainingModules?.[activeCategory] || [];
  const completedCount = currentModules?.filter(module => 
    completedModules?.includes(module.id)
  )?.length;

  return (
    <div className="space-y-6">
      {/* Training Overview */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Training Resources</h2>
            <p className="text-muted-foreground">Enhance your skills and maintain iSafari quality standards</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{completedModules?.length}</div>
            <div className="text-sm text-muted-foreground">Modules Completed</div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {trainingCategories?.map((category) => (
            <button
              key={category?.id}
              onClick={() => setActiveCategory(category?.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === category?.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name={category?.icon} size={16} />
              <span>{category?.name}</span>
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              {trainingCategories?.find(cat => cat?.id === activeCategory)?.name} Progress
            </span>
            <span className="text-sm text-muted-foreground">
              {completedCount}/{currentModules?.length} completed
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${currentModules?.length > 0 ? (completedCount / currentModules?.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Training Modules */}
        <div className="space-y-4">
          {currentModules?.map((module) => {
            const isCompleted = completedModules?.includes(module.id);
            return (
              <div key={module.id} className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                isCompleted ? 'border-success bg-success/5' : 'border-border bg-muted/30'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-2 rounded-lg ${isCompleted ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}`}>
                      <Icon name={getTypeIcon(module.type)} size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-foreground">{module.title}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                          {module.difficulty}
                        </span>
                        {isCompleted && (
                          <Icon name="CheckCircle" size={16} className="text-success" />
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3">{module.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Icon name="Clock" size={14} />
                          <span>{module.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Icon name="Tag" size={14} />
                          <span className="capitalize">{module.type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isCompleted ? (
                      <Button variant="outline" size="sm">
                        <Icon name="RotateCcw" size={16} />
                        Retake
                      </Button>
                    ) : (
                      <Button variant="default" size="sm">
                        <Icon name="Play" size={16} />
                        Start
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Certification Status */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Certification Status</h2>
            <p className="text-muted-foreground">Track your certification progress and renewals</p>
          </div>
          <Button variant="outline">
            <Icon name="Download" size={16} />
            Download Certificates
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Icon name="Award" size={24} className="text-success" />
              <div>
                <h3 className="font-semibold text-foreground">Emergency Response</h3>
                <p className="text-sm text-muted-foreground">Valid until Dec 2025</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-success font-medium">Certified</span>
              <Button variant="outline" size="sm">
                View Certificate
              </Button>
            </div>
          </div>

          <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Icon name="Clock" size={24} className="text-warning" />
              <div>
                <h3 className="font-semibold text-foreground">Cultural Sensitivity</h3>
                <p className="text-sm text-muted-foreground">Expires in 3 months</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-warning font-medium">Renewal Required</span>
              <Button variant="outline" size="sm">
                Renew Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingResources;