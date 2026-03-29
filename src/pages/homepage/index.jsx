import React from 'react';
import Header from '../../components/ui/Header';
import HeroSection from './components/HeroSection';
import StartJourneySection from './components/StartJourneySection';
import HowItWorksSection from './components/HowItWorksSection';
import TravelerStoriesSection from './components/TravelerStoriesSection';
import LiveActivityFeed from './components/LiveActivityFeed';
import TrustIndicators from './components/TrustIndicators';
import TrendingServices from './components/TrendingServices';
import { Footer2 } from '../../components/ui/footer-2';

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
      <Footer2 />
    </div>
  );
};

export default Homepage;