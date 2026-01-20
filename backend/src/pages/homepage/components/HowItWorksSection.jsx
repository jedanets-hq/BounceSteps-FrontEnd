import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const HowItWorksSection = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 1,
      title: "Discover",
      description: "Explore curated destinations with AI-powered recommendations tailored to your preferences and travel style.",
      icon: "Compass",
      features: ["AI-powered matching", "Local insights", "Real-time availability"],
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: 2,
      title: "Plan",
      description: "Build your perfect itinerary with our intelligent trip builder and expert concierge support.",
      icon: "Calendar",
      features: ["Smart itinerary builder", "Expert consultation", "Budget optimization"],
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      id: 3,
      title: "Experience",
      description: "Enjoy seamless travel with 24/7 support, exclusive access, and authentic local experiences.",
      icon: "MapPin",
      features: ["24/7 concierge", "Exclusive access", "Local partnerships"],
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      id: 4,
      title: "Share",
      description: "Capture memories and inspire others by sharing your journey with our global travel community.",
      icon: "Share2",
      features: ["Photo galleries", "Travel stories", "Community rewards"],
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps?.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [steps?.length]);

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-display font-medium text-foreground mb-6">
            How iSafari Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From inspiration to memories, we guide you through every step of your journey 
            with intelligent technology and human expertise.
          </p>
        </div>

        {/* Desktop View - Horizontal Steps */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-16 left-0 right-0 h-1 bg-border">
              <div 
                className="h-full bg-primary transition-all duration-1000 ease-out"
                style={{ width: `${((activeStep + 1) / steps?.length) * 100}%` }}
              ></div>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-4 gap-8">
              {steps?.map((step, index) => (
                <div
                  key={step?.id}
                  className={`relative cursor-pointer transition-all duration-500 ${
                    index <= activeStep ? 'opacity-100' : 'opacity-60'
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  {/* Step Circle */}
                  <div className={`relative z-10 w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                    index <= activeStep 
                      ? `${step?.bgColor} ${step?.color} shadow-lg scale-110` 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon name={step?.icon} size={24} />
                  </div>

                  {/* Step Content */}
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {step?.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                      {step?.description}
                    </p>
                    
                    {/* Features */}
                    <div className="space-y-2">
                      {step?.features?.map((feature, featureIndex) => (
                        <div 
                          key={featureIndex}
                          className={`flex items-center justify-center text-xs transition-all duration-300 delay-${featureIndex * 100} ${
                            index === activeStep ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                          }`}
                        >
                          <Icon name="Check" size={12} className={`mr-2 ${step?.color}`} />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile View - Vertical Steps */}
        <div className="lg:hidden space-y-8">
          {steps?.map((step, index) => (
            <div
              key={step?.id}
              className={`flex items-start space-x-4 p-6 rounded-xl transition-all duration-300 ${
                index === activeStep 
                  ? `${step?.bgColor} border-2 border-current ${step?.color}` 
                  : 'bg-muted/50 border border-border'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                index === activeStep 
                  ? `${step?.bgColor} ${step?.color}` 
                  : 'bg-background text-muted-foreground'
              }`}>
                <Icon name={step?.icon} size={20} />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step?.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  {step?.description}
                </p>
                
                <div className="space-y-1">
                  {step?.features?.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-xs">
                      <Icon name="Check" size={12} className={`mr-2 ${step?.color}`} />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Step Indicators for Mobile */}
        <div className="lg:hidden flex justify-center mt-8 space-x-2">
          {steps?.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === activeStep ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;