import React from 'react';
import Header from '../../components/ui/Header';
import HeroSection from './components/HeroSection';
import StartJourneySection from './components/StartJourneySection';
import HowItWorksSection from './components/HowItWorksSection';
import TravelerStoriesSection from './components/TravelerStoriesSection';
import LiveActivityFeed from './components/LiveActivityFeed';
import TrustIndicators from './components/TrustIndicators';
import TrendingServices from './components/TrendingServices';

const Homepage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <HeroSection />
        <StartJourneySection />
        <TrendingServices />
        <HowItWorksSection />
        <TravelerStoriesSection />
        <LiveActivityFeed />
        <TrustIndicators />
      </main>
      {/* Footer */}
      <footer className="bg-foreground text-background py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/iSafari Logo.png" 
                  alt="iSafari Global" 
                  className="h-10 w-auto"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
                <div className="flex flex-col">
                  <span className="font-display font-medium text-lg leading-none">
                    iSafari Global
                  </span>
                  <span className="font-body text-xs text-background/70 leading-none">
                    Powered by JEDA NETWORKS
                  </span>
                </div>
              </div>
              <p className="text-background/80 text-sm leading-relaxed max-w-md mb-4">
                Transforming travel through authentic cultural experiences, 
                intelligent planning, and personalized service that connects 
                you with the world's most extraordinary destinations.
              </p>
              
              {/* JEDA NETWORKS Attribution */}
              <div className="bg-background/10 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-background mb-2">Developed & Owned by JEDA NETWORKS</h4>
                <div className="text-xs text-background/80 space-y-1">
                  <p><strong>Partners:</strong></p>
                  <ul className="list-disc list-inside ml-2 space-y-0.5">
                    <li>JOCTAN MFUNGO</li>
                    <li>ELIZABETH ERNEST</li>
                    <li>DANFORD MWANKENJA</li>
                    <li>ASTERIA MOMBO</li>
                  </ul>
                  <p className="mt-2"><strong>Technology:</strong> Advanced Travel Solutions & Innovation</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-background mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-background/80">
                <li><a href="/destination-discovery" className="hover:text-background transition-colors">Destinations</a></li>
                <li><a href="/journey-planner" className="hover:text-background transition-colors">Plan Journey</a></li>
                <li><a href="/services-overview" className="hover:text-background transition-colors">Services</a></li>
                <li><a href="/traveler-dashboard" className="hover:text-background transition-colors">Dashboard</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-background mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-background/80">
                <li><a href="#" className="hover:text-background transition-colors">24/7 Concierge</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Travel Insurance</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Emergency Support</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-background/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left">
              <p className="text-background/60 text-sm">
                {new Date()?.getFullYear()} iSafari Global. All rights reserved.
              </p>
              <p className="text-sm text-muted-foreground">
                2024 Developed & Owned by JEDA NETWORKS. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-background/60 hover:text-background text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-background/60 hover:text-background text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-background/60 hover:text-background text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;