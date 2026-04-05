import { Search, MapPin, CalendarDays, User, Briefcase, Check, Users, Hand } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

const HeroSection = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Search form state
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    checkIn: '',
    checkOut: '',
    travelers: 1
  });

  // Navigation handler for buttons
  const handleButtonClick = (buttonType) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(getRedirectPath(buttonType))}`);
    } else {
      navigate(getRedirectPath(buttonType));
    }
  };

  // Get redirect path based on button type and user type
  const getRedirectPath = (buttonType) => {
    if (isAuthenticated && user?.userType === 'service_provider') {
      switch (buttonType) {
        case 'services':
          return '/service-provider-dashboard?tab=services';
        case 'bookings':
          return '/service-provider-dashboard?tab=bookings';
        default:
          return '/service-provider-dashboard';
      }
    } else {
      switch (buttonType) {
        case 'plan':
          return '/journey-planner';
        case 'book':
          return '/destination-discovery';
        case 'explore':
          return '/destination-discovery';
        case 'search':
          return '/journey-planner';
        default:
          return '/';
      }
    }
  };

  // Handle search button click
  const handleSearchClick = () => {
    if (!searchData.to.trim()) {
      alert('Please enter a destination');
      return;
    }

    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent('/journey-planner'));
    } else {
      navigate('/journey-planner', { 
        state: { 
          destination: searchData.to,
          region: searchData.from || 'Tanzania',
          startDate: searchData.checkIn,
          endDate: searchData.checkOut,
          travelers: searchData.travelers
        } 
      });
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle registration buttons
  const handleRegisterClick = (userType) => {
    navigate(`/register?userType=${userType}`);
  };

  return (
    <>
      <section id="home" className="relative h-[60vh] md:min-h-[90vh] flex flex-col justify-center md:justify-end overflow-hidden pt-16">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/hero-beach.jpg"
            alt="Tropical beach paradise"
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
          />
          {/* Light mode gradient */}
          <div className="absolute inset-0 gradient-fade-white dark:hidden" />
          {/* Dark mode gradient - darker overlay for better text visibility */}
          <div className="absolute inset-0 hidden dark:block bg-gradient-to-b from-background/60 via-background/70 to-background/90" />
        </div>

        {/* Content */}
        <div className="relative z-20 w-full px-4 pb-6 md:pb-12 content-padding">
          <div className="hero-content">
            <div className="mb-8 md:mb-8 md:mt-[-600px] max-w-4xl">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight max-w-2xl md:-ml-64">
                Plan Your Journey,
                <br />
                Book Everything in One Place
              </h1>
              <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-lg md:-ml-64">
                Flights, Hotels, Transport, Shopping & More
              </p>
              
              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3 md:-ml-64">
                {isAuthenticated && user?.userType === 'service_provider' ? (
                  // Service Provider Buttons
                  <>
                    <button 
                      onClick={() => handleButtonClick('services')}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-semibold transition-colors"
                    >
                      My Services
                    </button>
                    <button 
                      onClick={() => handleButtonClick('bookings')}
                      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 py-3 rounded-xl font-semibold transition-colors"
                    >
                      Bookings
                    </button>
                  </>
                ) : (
                  // Traveler Buttons
                  <>
                    <button 
                      onClick={() => handleButtonClick('plan')}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-semibold transition-colors"
                    >
                      Plan Your Journey
                    </button>
                    <button 
                      onClick={() => handleButtonClick('book')}
                      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 py-3 rounded-xl font-semibold transition-colors"
                    >
                      Book Now
                    </button>
                    <button 
                      onClick={() => handleButtonClick('explore')}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-xl font-semibold transition-colors"
                    >
                      Explore Destinations
                    </button>
                  </>
                )}
              </div>

              {/* Welcome Message for Logged In Users */}
              {isAuthenticated && user && (
                <div className="mt-6 md:-ml-64">
                  <p className="text-lg font-semibold text-foreground" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    <span className="text-secondary font-bold">
                      {user.user_type === 'service_provider' ? 'Service Provider' : 'Traveller'}
                    </span>{' '}
                    Welcome back, <span className="text-primary font-bold">{user.first_name || user.name || 'Friend'}</span>! <Hand size={20} className="inline text-yellow-500" />
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Search Section - Desktop - Only show for travelers */}
      {(!isAuthenticated || user?.userType !== 'service_provider') && (
        <div className="hidden md:block bg-transparent px-4 py-2 relative z-30 -mt-24">
          <div className="max-w-6xl mx-auto">
            <div className="bg-background/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-border">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {/* From */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin size={16} />
                    From
                  </label>
                  <input
                    type="text"
                    placeholder="Zanzibar, Tanzania"
                    value={searchData.from}
                    onChange={(e) => handleInputChange('from', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* To */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin size={16} />
                    To
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Destination"
                    value={searchData.to}
                    onChange={(e) => handleInputChange('to', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Check-in Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CalendarDays size={16} />
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={searchData.checkIn}
                    onChange={(e) => handleInputChange('checkIn', e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Check-out Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CalendarDays size={16} />
                    Check-out
                  </label>
                  <input
                    type="date"
                    value={searchData.checkOut}
                    onChange={(e) => handleInputChange('checkOut', e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Travelers */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users size={16} />
                    Travelers
                  </label>
                  <select
                    value={searchData.travelers}
                    onChange={(e) => handleInputChange('travelers', parseInt(e.target.value))}
                    className="w-full px-3 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {[1,2,3,4,5,6,7,8].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Traveler' : 'Travelers'}</option>
                    ))}
                  </select>
                </div>

                {/* Search Button */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground opacity-0">
                    Search
                  </label>
                  <button
                    onClick={handleSearchClick}
                    className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Search size={20} />
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Section - Mobile - Only show for travelers */}
      {(!isAuthenticated || user?.userType !== 'service_provider') && (
        <div className="md:hidden bg-transparent px-4 py-2 relative z-30 -mt-8">
          <div className="bg-card/95 backdrop-blur-md rounded-xl shadow-lg p-3 border border-border">
            <div className="space-y-3">
              {/* From */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <MapPin size={12} />
                  From
                </label>
                <input
                  type="text"
                  placeholder="Zanzibar, Tanzania"
                  value={searchData.from}
                  onChange={(e) => handleInputChange('from', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent text-sm"
                />
              </div>

              {/* To */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <MapPin size={12} />
                  To
                </label>
                <input
                  type="text"
                  placeholder="Enter Destination"
                  value={searchData.to}
                  onChange={(e) => handleInputChange('to', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent text-sm"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <CalendarDays size={12} />
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={searchData.checkIn}
                    onChange={(e) => handleInputChange('checkIn', e.target.value)}
                    className="w-full px-2 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <CalendarDays size={12} />
                    Check-out
                  </label>
                  <input
                    type="date"
                    value={searchData.checkOut}
                    onChange={(e) => handleInputChange('checkOut', e.target.value)}
                    className="w-full px-2 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Travelers */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Users size={12} />
                  Travelers
                </label>
                <select
                  value={searchData.travelers}
                  onChange={(e) => handleInputChange('travelers', parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent text-sm"
                >
                  {[1,2,3,4,5,6,7,8].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Traveler' : 'Travelers'}</option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearchClick}
                className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Search size={16} />
                Search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Cards Section */}
      <div className="bg-transparent px-4 py-8 relative z-30">
        {!isAuthenticated ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-3">Start Your Journey</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Whether you're a traveler seeking extraordinary experiences or a service provider ready to showcase your offerings, BounceSteps is your gateway to the world.
              </p>
            </div>

            {/* Desktop Cards */}
            <div className="hidden md:flex gap-8 justify-center">
              {/* Traveler Card */}
              <div className="flex-1 bg-card/95 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-border">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User size={32} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">I'm a Traveler</h3>
                  <p className="text-muted-foreground text-sm">
                    Discover amazing destinations, book experiences, and create unforgettable memories
                  </p>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check size={16} className="text-primary" />
                    <span>Book flights, hotels & experiences</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check size={16} className="text-primary" />
                    <span>Plan custom itineraries</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check size={16} className="text-primary" />
                    <span>Connect with local guides</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check size={16} className="text-primary" />
                    <span>Share travel stories</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleRegisterClick('traveler')}
                  className="w-full bg-primary hover:bg-accent text-primary-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <User size={20} />
                  Join as Traveler
                </button>
              </div>

              {/* Service Provider Card */}
              <div className="flex-1 bg-card/95 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-border">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase size={32} className="text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">I'm a Service Provider</h3>
                  <p className="text-muted-foreground text-sm">
                    Showcase your services, connect with travelers, and grow your business
                  </p>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check size={16} className="text-secondary" />
                    <span>List your services & experiences</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check size={16} className="text-secondary" />
                    <span>Manage bookings & payments</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check size={16} className="text-secondary" />
                    <span>Build your reputation</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check size={16} className="text-secondary" />
                    <span>Analytics & insights</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleRegisterClick('service_provider')}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Briefcase size={20} />
                  Join as Provider
                </button>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {/* Traveler Card */}
              <div className="bg-card/95 backdrop-blur-lg rounded-2xl shadow-xl p-4 border border-border">
                <div className="text-center mb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User size={24} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">I'm a Traveler</h3>
                  <p className="text-muted-foreground text-sm">
                    Discover destinations and create memories
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Check size={12} className="text-primary" />
                    <span>Book experiences</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Check size={12} className="text-primary" />
                    <span>Plan itineraries</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Check size={12} className="text-primary" />
                    <span>Local guides</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Check size={12} className="text-primary" />
                    <span>Share stories</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleRegisterClick('traveler')}
                  className="w-full bg-primary hover:bg-accent text-primary-foreground py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <User size={16} />
                  Join as Traveler
                </button>
              </div>

              {/* Service Provider Card */}
              <div className="bg-card/95 backdrop-blur-lg rounded-2xl shadow-xl p-4 border border-border">
                <div className="text-center mb-3">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Briefcase size={24} className="text-secondary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">I'm a Service Provider</h3>
                  <p className="text-muted-foreground text-sm">
                    Showcase services and grow your business
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Check size={12} className="text-secondary" />
                    <span>List services</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Check size={12} className="text-secondary" />
                    <span>Manage bookings</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Check size={12} className="text-secondary" />
                    <span>Build reputation</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Check size={12} className="text-secondary" />
                    <span>Get insights</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleRegisterClick('service_provider')}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <Briefcase size={16} />
                  Join as Provider
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-foreground mb-3">Continue Your Journey</h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              Ready for your next adventure with BounceSteps.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default HeroSection;