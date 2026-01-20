import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const OnboardingProgress = () => {
  const steps = [
    {
      id: 1,
      title: "Business Registration",
      description: "Submit business documents and credentials",
      status: "completed",
      icon: "FileText"
    },
    {
      id: 2,
      title: "Insurance Verification",
      description: "Upload insurance certificates and coverage details",
      status: "completed",
      icon: "Shield"
    },
    {
      id: 3,
      title: "Quality Standards",
      description: "Complete quality assessment and standards alignment",
      status: "in-progress",
      icon: "Award"
    },
    {
      id: 4,
      title: "Profile Setup",
      description: "Create your provider profile and service listings",
      status: "pending",
      icon: "User"
    },
    {
      id: 5,
      title: "Integration Testing",
      description: "Test booking system and payment integration",
      status: "pending",
      icon: "Settings"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success bg-success/10 border-success/20';
      case 'in-progress':
        return 'text-warning bg-warning/10 border-warning/20';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'CheckCircle';
      case 'in-progress':
        return 'Clock';
      default:
        return 'Circle';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Onboarding Progress</h2>
          <p className="text-muted-foreground">Complete all steps to activate your partnership</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">60%</div>
          <div className="text-sm text-muted-foreground">Complete</div>
        </div>
      </div>
      <div className="space-y-4">
        {steps?.map((step, index) => (
          <div key={step?.id} className="flex items-start space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${getStatusColor(step?.status)}`}>
              <Icon name={getStatusIcon(step?.status)} size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">{step?.title}</h3>
                {step?.status === 'in-progress' && (
                  <Button variant="outline" size="sm">
                    Continue
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{step?.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Need help? Contact our partner support team
          </div>
          <Button variant="outline" size="sm">
            <Icon name="MessageCircle" size={16} />
            Get Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingProgress;