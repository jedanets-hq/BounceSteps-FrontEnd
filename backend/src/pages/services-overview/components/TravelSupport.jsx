import React from 'react';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const TravelSupport = () => {
  const supportServices = [
    {
      id: 1,
      title: "Visa & Documentation",
      description: "Complete visa assistance and travel document preparation for seamless border crossings.",
      features: ["Visa application assistance", "Document verification", "Embassy appointments", "Express processing"],
      icon: "FileText",
      availability: "24/7",
      responseTime: "< 2 hours"
    },
    {
      id: 2,
      title: "Emergency Assistance",
      description: "Round-the-clock emergency support for medical, legal, and travel-related incidents worldwide.",
      features: ["Medical emergency support", "Legal assistance", "Emergency evacuation", "Lost document replacement"],
      icon: "Shield",
      availability: "24/7",
      responseTime: "< 15 minutes"
    },
    {
      id: 3,
      title: "Concierge Services",
      description: "Personal travel concierge for reservations, recommendations, and special arrangements.",
      features: ["Restaurant reservations", "Event bookings", "Personal shopping", "Special occasions"],
      icon: "Crown",
      availability: "Business hours",
      responseTime: "< 1 hour"
    },
    {
      id: 4,
      title: "Travel Insurance",
      description: "Comprehensive travel insurance coverage tailored to your specific journey and activities.",
      features: ["Medical coverage", "Trip cancellation", "Adventure sports", "Equipment protection"],
      icon: "Umbrella",
      availability: "24/7 claims",
      responseTime: "< 4 hours"
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: "David Chen",
      location: "Singapore",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
      content: "When I had a medical emergency in Morocco, iSafari's support team arranged everything - from hospital transfer to insurance claims. Incredible service!",
      rating: 5,
      service: "Emergency Assistance"
    },
    {
      id: 2,
      name: "Emma Thompson",
      location: "London, UK",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face",
      content: "The visa assistance for my multi-country trip was flawless. They handled everything while I focused on planning my adventure.",
      rating: 5,
      service: "Visa Services"
    },
    {
      id: 3,
      name: "Carlos Rodriguez",
      location: "Madrid, Spain",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
      content: "The concierge secured impossible reservations and made my anniversary trip unforgettable. Worth every penny!",
      rating: 5,
      service: "Concierge"
    }
  ];

  const supportStats = [
    { label: "Response Time", value: "< 2 min", icon: "Clock" },
    { label: "Languages Supported", value: "25+", icon: "Globe" },
    { label: "Countries Covered", value: "195", icon: "MapPin" },
    { label: "Customer Satisfaction", value: "99.2%", icon: "Heart" }
  ];

  return (
    <div className="bg-background py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-display font-medium text-foreground mb-4">
            Travel Support
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive 24/7 travel support ensuring peace of mind throughout your journey
          </p>
        </div>

        {/* Support Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {supportServices?.map((service) => (
            <div key={service?.id} className="bg-card border border-border rounded-xl p-6 shadow-soft hover:shadow-warm transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Icon name={service?.icon} size={24} className="text-primary" />
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {service?.title}
              </h3>
              
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                {service?.description}
              </p>

              <div className="space-y-2 mb-6">
                {service?.features?.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs">
                    <Icon name="Check" size={12} className="text-success" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Availability:</span>
                  <span className="font-medium text-foreground">{service?.availability}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Response:</span>
                  <span className="font-medium text-success">{service?.responseTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Support Stats */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-display font-medium text-foreground mb-2">
              Global Support Network
            </h3>
            <p className="text-muted-foreground">
              Our worldwide support infrastructure ensures help is always available when you need it
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {supportStats?.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name={stat?.icon} size={24} className="text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary mb-1">{stat?.value}</div>
                <div className="text-sm text-muted-foreground">{stat?.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contact Card */}
        <div className="bg-gradient-to-r from-error/5 to-warning/5 border border-error/20 rounded-2xl p-8 mb-16">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="Phone" size={24} className="text-error" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                24/7 Emergency Hotline
              </h3>
              <p className="text-muted-foreground mb-4">
                In case of emergency, our dedicated support team is available around the clock in multiple languages.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center space-x-2">
                  <Icon name="Phone" size={16} className="text-error" />
                  <span className="font-mono text-lg font-semibold text-foreground">+1-800-ISAFARI</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="MessageCircle" size={16} className="text-primary" />
                  <span className="text-muted-foreground">Live chat available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-display font-medium text-foreground mb-4">
              Real Support Stories
            </h3>
            <p className="text-muted-foreground">
              Hear from travelers who experienced our support firsthand
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials?.map((testimonial) => (
              <div key={testimonial?.id} className="bg-card border border-border rounded-xl p-6 shadow-soft">
                <div className="flex items-center space-x-3 mb-4">
                  <Image
                    src={testimonial?.avatar}
                    alt={testimonial?.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-semibold text-foreground">{testimonial?.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial?.location}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(testimonial?.rating)]?.map((_, i) => (
                    <Icon key={i} name="Star" size={14} className="text-warning fill-current" />
                  ))}
                </div>

                <blockquote className="text-muted-foreground leading-relaxed mb-4">
                  "{testimonial?.content}"
                </blockquote>

                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  <Icon name="CheckCircle" size={14} />
                  <span>{testimonial?.service}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support CTA */}
        <div className="text-center">
          <h3 className="text-2xl font-display font-medium text-foreground mb-4">
            Need Assistance?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our support specialists are ready to help with any travel-related questions or concerns. Contact us anytime, anywhere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="default" size="lg" iconName="Phone" iconPosition="left">
              Call Support
            </Button>
            <Button variant="outline" size="lg" iconName="MessageCircle" iconPosition="left">
              Live Chat
            </Button>
            <Button variant="secondary" size="lg" iconName="Mail" iconPosition="left">
              Email Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelSupport;