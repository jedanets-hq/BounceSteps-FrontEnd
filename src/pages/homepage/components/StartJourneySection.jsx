import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { Globe } from '../../../components/ui/cobe-globe';

const StartJourneySection = () => {
  const { user, isAuthenticated } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const markers = [
    { id: "dar", location: [-6.7924, 39.2083], label: "Dar-es-Salaam" }, // East Africa focus
    { id: "sf", location: [37.7595, -122.4367], label: "San Francisco" },
    { id: "nyc", location: [40.7128, -74.006], label: "New York" },
    { id: "london", location: [51.5074, -0.1278], label: "London" },
    { id: "tokyo", location: [35.6762, 139.6503], label: "Tokyo" },
    { id: "dubai", location: [25.2048, 55.2708], label: "Dubai" },
    { id: "paris", location: [48.8566, 2.3522], label: "Paris" },
    { id: "sydney", location: [-33.8688, 151.2093], label: "Sydney" },
  ];

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-background">
      {/* Animated Globe Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
          <Globe 
            markers={markers}
            className="w-full h-full"
            speed={0.0015}
            dark={0}
            baseColor={[1, 1, 1]}
            markerColor={[0.1, 0.45, 0.25]} // Primary green focus
            glowColor={[0.1, 0.45, 0.25]}
          />
        </div>
        {/* Subtle radial gradient overlay to soften edges */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-background/50 to-background pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-medium text-foreground mb-3 md:mb-6 px-4">
            Start Your Journey
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Whether you're a traveler seeking extraordinary experiences or a service provider 
            ready to showcase your offerings, BounceSteps is your gateway to the world.
          </p>
        </div>

        {isAuthenticated ? (
          // Authenticated User Experience
          <div className="max-w-4xl mx-auto">
            <div className="bg-card/40 backdrop-blur-md rounded-2xl shadow-warm p-5 sm:p-8 mb-8 border border-border/50">
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-4 mb-8 md:mb-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner">
                  <span className="text-2xl sm:text-3xl font-bold text-primary">
                    {user?.firstName?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex flex-col justify-center sm:pt-2">
                  <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-1">
                    Welcome back, {user?.firstName}!
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {user?.userType === 'traveler' 
                      ? 'Ready for your next adventure?' 
                      : '🏢 Manage your services and grow your business'
                    }
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-6 px-1 sm:px-4 md:px-0">
                {user?.userType === 'traveler' ? (
                  <>
                    <Link to="/journey-planner" className="group block h-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background rounded-xl">
                      <div className="h-full w-full p-2 sm:p-3 md:p-6 border border-border/60 bg-card/40 rounded-xl hover:border-primary/50 hover:shadow-soft active:scale-[0.98] transition-all duration-300 group-hover:-translate-y-1 flex flex-col items-center justify-center text-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-5 group-hover:bg-primary/20 transition-colors shadow-sm mx-auto">
                          <Icon name="Calendar" className="w-[60%] h-[60%] md:w-6 md:h-6 text-primary" />
                        </div>
                        <h4 className="text-[10px] sm:text-xs md:text-xl font-semibold text-foreground mb-0 md:mb-2 leading-tight">Plan New Journey</h4>
                        <p className="hidden md:block text-muted-foreground text-sm leading-relaxed">Create personalized itineraries with AI assistance</p>
                      </div>
                    </Link>

                    <Link to="/destination-discovery" className="group block h-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background rounded-xl">
                      <div className="h-full w-full p-2 sm:p-3 md:p-6 border border-border/60 bg-card/40 rounded-xl hover:border-primary/50 hover:shadow-soft active:scale-[0.98] transition-all duration-300 group-hover:-translate-y-1 flex flex-col items-center justify-center text-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-5 group-hover:bg-primary/20 transition-colors shadow-sm mx-auto">
                          <Icon name="MapPin" className="w-[60%] h-[60%] md:w-6 md:h-6 text-primary" />
                        </div>
                        <h4 className="text-[10px] sm:text-xs md:text-xl font-semibold text-foreground mb-0 md:mb-2 leading-tight">Explore Destinations</h4>
                        <p className="hidden md:block text-muted-foreground text-sm leading-relaxed">Discover amazing places around the world</p>
                      </div>
                    </Link>

                    <Link to="/traveler-dashboard" className="group block h-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background rounded-xl">
                      <div className="h-full w-full p-2 sm:p-3 md:p-6 border border-border/60 bg-card/40 rounded-xl hover:border-primary/50 hover:shadow-soft active:scale-[0.98] transition-all duration-300 group-hover:-translate-y-1 flex flex-col items-center justify-center text-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-5 group-hover:bg-primary/20 transition-colors shadow-sm mx-auto">
                          <Icon name="User" className="w-[60%] h-[60%] md:w-6 md:h-6 text-primary" />
                        </div>
                        <h4 className="text-[10px] sm:text-xs md:text-xl font-semibold text-foreground mb-0 md:mb-2 leading-tight">My Profile</h4>
                        <p className="hidden md:block text-muted-foreground text-sm leading-relaxed">Manage your preferences and bookings</p>
                      </div>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/service-provider-dashboard" className="group block h-full focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:ring-offset-2 focus:ring-offset-background rounded-xl">
                      <div className="h-full w-full p-2 sm:p-3 md:p-6 border border-border/60 bg-card/40 rounded-xl hover:border-secondary/50 hover:shadow-soft active:scale-[0.98] transition-all duration-300 group-hover:-translate-y-1 flex flex-col items-center justify-center text-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-5 group-hover:bg-secondary/20 transition-colors shadow-sm mx-auto">
                          <Icon name="Settings" className="w-[60%] h-[60%] md:w-6 md:h-6 text-secondary" />
                        </div>
                        <h4 className="text-[10px] sm:text-xs md:text-xl font-semibold text-foreground mb-0 md:mb-2 leading-tight">Manage Services</h4>
                        <p className="hidden md:block text-muted-foreground text-sm leading-relaxed">Update your offerings and availability</p>
                      </div>
                    </Link>

                    <Link to="/dashboard" className="group block h-full focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:ring-offset-2 focus:ring-offset-background rounded-xl">
                      <div className="h-full w-full p-2 sm:p-3 md:p-6 border border-border/60 bg-card/40 rounded-xl hover:border-secondary/50 hover:shadow-soft active:scale-[0.98] transition-all duration-300 group-hover:-translate-y-1 flex flex-col items-center justify-center text-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-5 group-hover:bg-secondary/20 transition-colors shadow-sm mx-auto">
                          <Icon name="TrendingUp" className="w-[60%] h-[60%] md:w-6 md:h-6 text-secondary" />
                        </div>
                        <h3 className="text-[10px] sm:text-xs md:text-xl font-semibold text-foreground mb-0 md:mb-2 leading-tight">Analytics</h3>
                        <p className="hidden md:block text-muted-foreground text-sm leading-relaxed mb-0">Track your travel patterns and preferences</p>
                      </div>
                    </Link>

                    <Link to="/service-provider-dashboard" className="group block h-full focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:ring-offset-2 focus:ring-offset-background rounded-xl">
                      <div className="h-full w-full p-2 sm:p-3 md:p-6 border border-border/60 bg-card/40 rounded-xl hover:border-secondary/50 hover:shadow-soft active:scale-[0.98] transition-all duration-300 group-hover:-translate-y-1 flex flex-col items-center justify-center text-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-5 group-hover:bg-secondary/20 transition-colors shadow-sm mx-auto">
                          <Icon name="Briefcase" className="w-[60%] h-[60%] md:w-6 md:h-6 text-secondary" />
                        </div>
                        <h4 className="text-[10px] sm:text-xs md:text-xl font-semibold text-foreground mb-0 md:mb-2 leading-tight">Business Profile</h4>
                        <p className="hidden md:block text-muted-foreground text-sm leading-relaxed">Manage your business information</p>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Non-authenticated User Experience
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12 lg:mb-16">
              {/* Traveler Path */}
              <div className="bg-card/30 backdrop-blur-md rounded-2xl shadow-warm p-6 sm:p-8 hover:shadow-soft border border-white/10 transition-all duration-300">
                <div className="text-center mb-6 lg:mb-8">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                    <Icon name="User" size={24} lg:size={32} className="text-primary" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-semibold text-foreground mb-3 lg:mb-4">I'm a Traveler</h3>
                  <p className="text-muted-foreground text-sm lg:text-base">
                    Discover extraordinary destinations and create unforgettable memories with personalized travel experiences.
                  </p>
                </div>

                <div className="space-y-3 lg:space-y-4 mb-6 lg:mb-8">
                  <div className="flex items-center space-x-3">
                    <Icon name="Check" size={16} className="text-primary flex-shrink-0" />
                    <span className="text-foreground text-sm lg:text-base">AI-powered journey planning</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Icon name="Check" size={16} className="text-primary flex-shrink-0" />
                    <span className="text-foreground text-sm lg:text-base">Curated local experiences</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Icon name="Check" size={16} className="text-primary flex-shrink-0" />
                    <span className="text-foreground text-sm lg:text-base">24/7 concierge support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Icon name="Check" size={16} className="text-primary flex-shrink-0" />
                    <span className="text-foreground text-sm lg:text-base">Seamless booking management</span>
                  </div>
                </div>

                <Link to="/register">
                  <Button variant="default" fullWidth size="lg" className="text-sm lg:text-base">
                    <Icon name="UserPlus" size={16} lg:size={20} />
                    Start as Traveler
                  </Button>
                </Link>
              </div>

              {/* Service Provider Path */}
              <div className="bg-card/30 backdrop-blur-md rounded-2xl shadow-warm p-6 sm:p-8 hover:shadow-soft border border-white/10 transition-all duration-300">
                <div className="text-center mb-6 lg:mb-8">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                    <Icon name="Briefcase" size={24} lg:size={32} className="text-secondary" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-semibold text-foreground mb-3 lg:mb-4">I'm a Service Provider</h3>
                  <p className="text-muted-foreground text-sm lg:text-base">
                    Connect with travelers worldwide and grow your business with our comprehensive platform.
                  </p>
                </div>

                <div className="space-y-3 lg:space-y-4 mb-6 lg:mb-8">
                  <div className="flex items-center space-x-3">
                    <Icon name="Check" size={16} className="text-secondary flex-shrink-0" />
                    <span className="text-foreground text-sm lg:text-base">Global traveler network</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Icon name="Check" size={16} className="text-secondary flex-shrink-0" />
                    <span className="text-foreground text-sm lg:text-base">Advanced booking management</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Icon name="Check" size={16} className="text-secondary flex-shrink-0" />
                    <span className="text-foreground text-sm lg:text-base">Performance analytics</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Icon name="Check" size={16} className="text-secondary flex-shrink-0" />
                    <span className="text-foreground text-sm lg:text-base">Marketing tools & support</span>
                  </div>
                </div>

                <Link to="/register">
                  <Button variant="secondary" fullWidth size="lg" className="text-sm lg:text-base">
                    <Icon name="Building" size={16} lg:size={20} />
                    Start as Provider
                  </Button>
                </Link>
              </div>
            </div>

            {/* Already have an account */}
            <div className="text-center">
              <p className="text-muted-foreground mb-4 text-sm lg:text-base">Already have an account?</p>
              <Link to="/login">
                <Button variant="outline" size="lg" className="text-sm lg:text-base">
                  <Icon name="LogIn" size={16} lg:size={20} />
                  Sign In to Continue
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default StartJourneySection;
