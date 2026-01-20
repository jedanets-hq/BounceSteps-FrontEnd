import React from 'react';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ServiceHero = ({ activeTab, onBookNow }) => {
  const heroContent = {
    transportation: {
      title: "Transportation Hub",
      subtitle: "Seamless journeys from door to destination",
      description: "Experience luxury travel with our curated transportation network featuring private jets, premium transfers, and unique transport adventures.",
      image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&h=400&fit=crop",
      stats: [
        { label: "Global Partners", value: "2,500+" },
        { label: "Cities Covered", value: "850+" },
        { label: "Customer Rating", value: "4.9/5" }
      ]
    },
    accommodation: {
      title: "Accommodation Curation",
      subtitle: "Extraordinary stays beyond ordinary hotels",
      description: "Discover handpicked accommodations from luxury resorts to unique local experiences, each verified for quality and authenticity.",
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=400&fit=crop",
      stats: [
        { label: "Unique Properties", value: "15,000+" },
        { label: "Countries", value: "120+" },
        { label: "Guest Satisfaction", value: "98%" }
      ]
    },
    experience: {
      title: "Experience Design",
      subtitle: "Cultural immersion crafted by local experts",
      description: "Transform your journey with authentic experiences designed by local cultural ambassadors and expert guides.",
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=400&fit=crop",
      stats: [
        { label: "Local Experts", value: "5,000+" },
        { label: "Unique Experiences", value: "25,000+" },
        { label: "Cultural Immersion", value: "100%" }
      ]
    },
    events: {
      title: "Event Access",
      subtitle: "Exclusive access to world-class events",
      description: "Secure premium access to sporting events, cultural festivals, and exclusive gatherings worldwide.",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=400&fit=crop",
      stats: [
        { label: "Exclusive Events", value: "1,200+" },
        { label: "VIP Access", value: "Premium" },
        { label: "Success Rate", value: "99.8%" }
      ]
    },
    support: {
      title: "Travel Support",
      subtitle: "24/7 assistance for seamless journeys",
      description: "Comprehensive travel support including visa assistance, emergency services, and personalized concierge care.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop",
      stats: [
        { label: "Response Time", value: "<2 min" },
        { label: "Languages", value: "25+" },
        { label: "Availability", value: "24/7" }
      ]
    }
  };

  const content = heroContent?.[activeTab];

  return (
    <div className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                <Icon name="Sparkles" size={16} />
                <span>Premium Service</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-display font-medium text-foreground leading-tight">
                {content?.title}
              </h1>
              
              <p className="text-xl text-secondary font-medium">
                {content?.subtitle}
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {content?.description}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              {content?.stats?.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-primary">
                    {stat?.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {stat?.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="default" 
                size="lg"
                iconName="Calendar"
                iconPosition="left"
                onClick={onBookNow}
              >
                Book Now
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                iconName="MessageCircle"
                iconPosition="left"
              >
                Speak to Expert
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={content?.image}
                alt={content?.title}
                className="w-full h-96 lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-xl p-6 shadow-warm max-w-xs">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="Award" size={24} className="text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Verified Quality</div>
                  <div className="text-sm text-muted-foreground">Premium certified</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceHero;