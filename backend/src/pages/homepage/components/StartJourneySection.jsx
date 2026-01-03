import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const StartJourneySection = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-medium text-foreground mb-6">
            Start Your Journey
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Whether you're a traveler seeking extraordinary experiences or a service provider 
            ready to showcase your offerings, iSafari Global is your gateway to the world.
          </p>
        </div>

        {isAuthenticated ? (
          // Authenticated User Experience
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl shadow-warm p-8 mb-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {user?.firstName?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-foreground">
                    Welcome back, {user?.firstName}!
                  </h3>
                  <p className="text-muted-foreground">
                    {user?.userType === 'traveler' 
                      ? '🧳 Ready for your next adventure?' 
                      : '🏢 Manage your services and grow your business'
                    }
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {user?.userType === 'traveler' ? (
                  <>
                    <Link to="/journey-planner" className="group">
                      <div className="p-6 border border-border rounded-xl hover:border-primary/50 hover:shadow-soft transition-all duration-300 group-hover:scale-105">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                          <Icon name="Calendar" size={24} className="text-primary" />
                        </div>
                        <h4 className="text-lg font-semibold text-foreground mb-2">Plan New Journey</h4>
                        <p className="text-muted-foreground text-sm">Create personalized itineraries with AI assistance</p>
                      </div>
                    </Link>

                    <Link to="/destination-discovery" className="group">
                      <div className="p-6 border border-border rounded-xl hover:border-primary/50 hover:shadow-soft transition-all duration-300 group-hover:scale-105">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                          <Icon name="MapPin" size={24} className="text-primary" />
                        </div>
                        <h4 className="text-lg font-semibold text-foreground mb-2">Explore Destinations</h4>
                        <p className="text-muted-foreground text-sm">Discover amazing places around the world</p>
                      </div>
                    </Link>

                    <Link to="/profile" className="group">
                      <div className="p-6 border border-border rounded-xl hover:border-primary/50 hover:shadow-soft transition-all duration-300 group-hover:scale-105">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                          <Icon name="User" size={24} className="text-primary" />
                        </div>
                        <h4 className="text-lg font-semibold text-foreground mb-2">My Profile</h4>
                        <p className="text-muted-foreground text-sm">Manage your preferences and bookings</p>
                      </div>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/provider-partnership-portal" className="group">
                      <div className="p-6 border border-border rounded-xl hover:border-secondary/50 hover:shadow-soft transition-all duration-300 group-hover:scale-105">
                        <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                          <Icon name="Settings" size={24} className="text-secondary" />
                        </div>
                        <h4 className="text-lg font-semibold text-foreground mb-2">Manage Services</h4>
                        <p className="text-muted-foreground text-sm">Update your offerings and availability</p>
                      </div>
                    </Link>

                    <Link to="/dashboard">
                      <div className="p-6 border border-border rounded-xl hover:border-secondary/50 hover:shadow-soft transition-all duration-300 cursor-pointer">
                        <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                          <Icon name="TrendingUp" size={24} className="text-secondary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Analytics</h3>
                        <p className="text-muted-foreground mb-4">Track your travel patterns and preferences</p>
                        <Icon name="ArrowRight" size={16} className="text-secondary" />
                      </div>
                    </Link>

                    <Link to="/profile" className="group">
                      <div className="p-6 border border-border rounded-xl hover:border-secondary/50 hover:shadow-soft transition-all duration-300 group-hover:scale-105">
                        <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                          <Icon name="Briefcase" size={24} className="text-secondary" />
                        </div>
                        <h4 className="text-lg font-semibold text-foreground mb-2">Business Profile</h4>
                        <p className="text-muted-foreground text-sm">Manage your business information</p>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {/* Traveler Path */}
              <div className="bg-card rounded-2xl shadow-warm p-8 hover:shadow-soft transition-all duration-300">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon name="User" size={32} className="text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4">I'm a Traveler</h3>
                  <p className="text-muted-foreground">
                    Discover extraordinary destinations and create unforgettable memories with personalized travel experiences.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <Icon name="Check" size={16} className="text-primary" />
                    <span className="text-foreground">AI-powered journey planning</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Icon name="Check" size={16} className="text-primary" />
                    <span className="text-foreground">Curated local experiences</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Icon name="Check" size={16} className="text-primary" />
                    <span className="text-foreground">24/7 concierge support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Icon name="Check" size={16} className="text-primary" />
                    <span className="text-foreground">Seamless booking management</span>
                  </div>
                </div>

                <Link to="/register">
                  <Button variant="default" fullWidth size="lg">
                    <Icon name="UserPlus" size={20} />
                    Start as Traveler
                  </Button>
                </Link>
              </div>

              {/* Service Provider Path */}
              <div className="bg-card rounded-2xl shadow-warm p-8 hover:shadow-soft transition-all duration-300">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon name="Briefcase" size={32} className="text-secondary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4">I'm a Service Provider</h3>
                  <p className="text-muted-foreground">
                    Connect with travelers worldwide and grow your business with our comprehensive platform.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <Icon name="Check" size={16} className="text-secondary" />
                    <span className="text-foreground">Global traveler network</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Icon name="Check" size={16} className="text-secondary" />
                    <span className="text-foreground">Advanced booking management</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Icon name="Check" size={16} className="text-secondary" />
                    <span className="text-foreground">Performance analytics</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Icon name="Check" size={16} className="text-secondary" />
                    <span className="text-foreground">Marketing tools & support</span>
                  </div>
                </div>

                <Link to="/register">
                  <Button variant="secondary" fullWidth size="lg">
                    <Icon name="Building" size={20} />
                    Start as Provider
                  </Button>
                </Link>
              </div>
            </div>

            {/* Already have an account */}
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Already have an account?</p>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  <Icon name="LogIn" size={20} />
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
