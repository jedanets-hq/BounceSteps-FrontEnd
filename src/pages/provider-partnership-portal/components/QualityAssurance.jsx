import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QualityAssurance = () => {
  const [selectedMetric, setSelectedMetric] = useState('ratings');

  const qualityMetrics = {
    ratings: {
      overall: 4.8,
      breakdown: [
        { category: 'Service Quality', score: 4.9, feedback: 'Excellent attention to detail' },
        { category: 'Communication', score: 4.7, feedback: 'Responsive and professional' },
        { category: 'Value for Money', score: 4.8, feedback: 'Great value proposition' },
        { category: 'Authenticity', score: 4.9, feedback: 'Genuine cultural experiences' }
      ]
    },
    performance: {
      onTimeRate: 98,
      cancellationRate: 2,
      responseTime: '< 2 hours',
      rebookingRate: 85
    },
    feedback: [
      {
        id: 1,
        traveler: 'Sarah M.',
        rating: 5,
        comment: `The Maasai village experience was absolutely incredible. Our guide was knowledgeable and respectful, and the community welcomed us warmly. This felt like a genuine cultural exchange rather than a tourist attraction.`,
        date: '2025-01-08',
        experience: 'Maasai Village Experience'
      },
      {
        id: 2,
        traveler: 'David L.',
        rating: 5,
        comment: `Outstanding safari experience! The conservation expert provided fascinating insights about wildlife protection efforts. Saw the Big Five and learned so much about ecosystem preservation.`,
        date: '2025-01-05',
        experience: 'Conservation Safari'
      },
      {
        id: 3,
        traveler: 'Emma R.',
        rating: 4,
        comment: `Wonderful cooking class! Learned to prepare traditional dishes with local ingredients. The chef was patient and shared great stories about food culture. Only minor issue was timing - ran a bit long.`,
        date: '2025-01-03',
        experience: 'Traditional Cooking Class'
      }
    ]
  };

  const improvements = [
    {
      id: 1,
      category: 'Communication',
      suggestion: 'Consider sending pre-experience briefings 24 hours before tours',
      priority: 'medium',
      impact: 'Enhance traveler preparation and satisfaction'
    },
    {
      id: 2,
      category: 'Accessibility',
      suggestion: 'Add accessibility information to experience descriptions',
      priority: 'high',
      impact: 'Improve inclusivity and reduce booking conflicts'
    },
    {
      id: 3,
      category: 'Sustainability',
      suggestion: 'Highlight environmental conservation efforts in marketing materials',
      priority: 'medium',
      impact: 'Attract eco-conscious travelers and align with iSafari values'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-error bg-error/10';
      case 'medium':
        return 'text-warning bg-warning/10';
      case 'low':
        return 'text-success bg-success/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quality Overview */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Quality Assurance Dashboard</h2>
            <p className="text-muted-foreground">Monitor performance and traveler satisfaction</p>
          </div>
          <div className="flex items-center space-x-2">
            {['ratings', 'performance', 'feedback']?.map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-4 py-2 text-sm rounded-md transition-colors capitalize ${
                  selectedMetric === metric
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {metric}
              </button>
            ))}
          </div>
        </div>

        {selectedMetric === 'ratings' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">{qualityMetrics?.ratings?.overall}</div>
              <div className="flex items-center justify-center space-x-1 mb-2">
                {[1, 2, 3, 4, 5]?.map((star) => (
                  <Icon
                    key={star}
                    name="Star"
                    size={20}
                    className={star <= Math.floor(qualityMetrics?.ratings?.overall) ? 'text-warning fill-current' : 'text-muted-foreground'}
                  />
                ))}
              </div>
              <p className="text-muted-foreground">Overall Rating</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {qualityMetrics?.ratings?.breakdown?.map((item, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-foreground">{item?.category}</h3>
                    <div className="flex items-center space-x-1">
                      <Icon name="Star" size={16} className="text-warning fill-current" />
                      <span className="font-semibold">{item?.score}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{item?.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedMetric === 'performance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-success mb-2">{qualityMetrics?.performance?.onTimeRate}%</div>
              <p className="text-sm text-muted-foreground">On-Time Rate</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-success mb-2">{qualityMetrics?.performance?.cancellationRate}%</div>
              <p className="text-sm text-muted-foreground">Cancellation Rate</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary mb-2">{qualityMetrics?.performance?.responseTime}</div>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary mb-2">{qualityMetrics?.performance?.rebookingRate}%</div>
              <p className="text-sm text-muted-foreground">Rebooking Rate</p>
            </div>
          </div>
        )}

        {selectedMetric === 'feedback' && (
          <div className="space-y-4">
            {qualityMetrics?.feedback?.map((review) => (
              <div key={review?.id} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon name="User" size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{review?.traveler}</h3>
                      <p className="text-sm text-muted-foreground">{review?.experience}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5]?.map((star) => (
                        <Icon
                          key={star}
                          name="Star"
                          size={14}
                          className={star <= review?.rating ? 'text-warning fill-current' : 'text-muted-foreground'}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">{review?.date}</span>
                  </div>
                </div>
                <p className="text-foreground">{review?.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Improvement Recommendations */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Improvement Recommendations</h2>
            <p className="text-muted-foreground">AI-powered suggestions to enhance your service quality</p>
          </div>
          <Button variant="outline" size="sm">
            <Icon name="RefreshCw" size={16} />
            Refresh Analysis
          </Button>
        </div>

        <div className="space-y-4">
          {improvements?.map((improvement) => (
            <div key={improvement?.id} className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-foreground">{improvement?.category}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(improvement?.priority)}`}>
                      {improvement?.priority} priority
                    </span>
                  </div>
                  <p className="text-foreground mb-2">{improvement?.suggestion}</p>
                  <p className="text-sm text-muted-foreground">{improvement?.impact}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Icon name="CheckCircle" size={16} />
                    Implement
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Icon name="X" size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QualityAssurance;