import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import ServiceHero from './components/ServiceHero';
import ServiceTabs from './components/ServiceTabs';
import TransportationHub from './components/TransportationHub';
import AccommodationCuration from './components/AccommodationCuration';
import ExperienceDesign from './components/ExperienceDesign';
import EventAccess from './components/EventAccess';
import TravelSupport from './components/TravelSupport';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const ServicesOverview = () => {
  const [activeTab, setActiveTab] = useState('accommodation');

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Smooth scroll to content
    const element = document.getElementById('service-content');
    if (element) {
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookNow = () => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('isafari_user');
    if (!savedUser) {
      window.location.href = '/login?redirect=/services-overview';
      return;
    }
    // Navigate to cart & payment
    window.location.href = '/traveler-dashboard?tab=cart&openPayment=true';
  };

  const renderServiceContent = () => {
    switch (activeTab) {
      case 'accommodation':
        return <AccommodationCuration />;
      case 'transportation':
        return <TransportationHub />;
      case 'food':
        return <ExperienceDesign title="Food & Dining" description="Discover local restaurants, cafes, and culinary experiences" />;
      case 'tours':
        return <ExperienceDesign title="Tours & Activities" description="Explore safaris, city tours, and adventure activities" />;
      case 'shopping':
        return <ExperienceDesign title="Shopping" description="Find local markets, crafts, and shopping destinations" />;
      case 'health':
        return <ExperienceDesign title="Health & Wellness" description="Spas, fitness centers, and wellness retreats" />;
      case 'entertainment':
        return <EventAccess />;
      case 'services':
        return <TravelSupport />;
      default:
        return <AccommodationCuration />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Services Overview - iSafari Global | Premium Travel Services</title>
        <meta name="description" content="Discover iSafari's comprehensive travel ecosystem featuring transportation, accommodation, experiences, exclusive events, and 24/7 support services." />
        <meta name="keywords" content="travel services, luxury transportation, unique accommodations, cultural experiences, exclusive events, travel support" />
      </Helmet>
      <Header />
      {/* Hero Section */}
      <ServiceHero activeTab={activeTab} onBookNow={handleBookNow} />
      {/* Service Navigation Tabs */}
      <ServiceTabs activeTab={activeTab} onTabChange={handleTabChange} />
      {/* Service Content */}
      <div id="service-content">
        {renderServiceContent()}
      </div>
      {/* Global CTA Section */}
      <div className="bg-gradient-to-r from-primary to-secondary py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-display font-medium mb-6">
            Ready to Experience iSafari Services?
          </h2>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            Join thousands of travelers who trust iSafari for their most important journeys. 
            Our comprehensive service ecosystem ensures every detail is perfectly orchestrated.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              variant="secondary" 
              size="lg"
              iconName="Calendar"
              iconPosition="left"
              onClick={handleBookNow}
            >
              Start Planning Journey
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              iconName="MessageCircle"
              iconPosition="left"
              className="border-white/30 text-white hover:bg-white/10"
            >
              Speak to Travel Expert
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-80">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">50,000+</div>
              <div className="text-sm">Happy Travelers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">195</div>
              <div className="text-sm">Countries Served</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">24/7</div>
              <div className="text-sm">Global Support</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">4.9/5</div>
              <div className="text-sm">Customer Rating</div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="Globe" size={16} className="text-white" />
                </div>
                <span className="font-display font-medium text-lg">iSafari Global</span>
              </div>
              <p className="text-background/70 text-sm leading-relaxed">
                Your gateway to authentic global travel experiences with premium service and local expertise.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><a href="#" className="hover:text-background transition-colors">Transportation</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Accommodation</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Experiences</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Event Access</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><a href="#" className="hover:text-background transition-colors">24/7 Assistance</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Travel Insurance</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Emergency Help</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Visa Services</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-background/70">
                <p className="flex items-center">
                  <Icon name="Phone" size={14} className="mr-2" />
                  +1-800-ISAFARI
                </p>
                <p className="flex items-center">
                  <Icon name="Mail" size={14} className="mr-2" />
                  hello@isafari.global
                </p>
                <p className="flex items-center">
                  <Icon name="MapPin" size={14} className="mr-2" />
                  Global Headquarters
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm text-background/70">
            <p>&copy; {new Date()?.getFullYear()} iSafari Global. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ServicesOverview;