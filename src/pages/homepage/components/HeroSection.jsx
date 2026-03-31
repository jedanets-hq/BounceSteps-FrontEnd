import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import { PaymentModal, BookingConfirmation } from '../../../components/PaymentSystem';
import { servicesAPI } from '../../../utils/api';

const HeroSection = () => {
  const navigate = useNavigate();
  const { addToCart, cartItems, getCartTotal } = useCart();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [booking, setBooking] = useState(null);
  
  // Check if user is service provider - use AuthContext instead of localStorage
  const isServiceProvider = user?.userType === 'service_provider';

  useEffect(() => {
    fetchFeaturedServices();
  }, []);

  const fetchFeaturedServices = async () => {
    try {
      console.log('📡 [HeroSection] Fetching featured services...');
      
      // Get ONLY featured slides (is_featured = true)
      const data = await servicesAPI.getAll({ featured: true, limit: 6 });
      
      if (data.success && data.services && data.services.length > 0) {
        console.log('✅ [HeroSection] Featured services loaded:', data.services.length);
        setFeaturedServices(data.services);
      } else {
        // NO FALLBACK - if no featured services, show empty
        console.log('⚠️ [HeroSection] No featured services found');
        setFeaturedServices([]);
      }
    } catch (err) {
      console.error('❌ [HeroSection] Error fetching featured services:', err);
      setFeaturedServices([]);
    } finally {
      setLoading(false);
    }
  };

  // Use real featured services
  const heroSlides = featuredServices;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides?.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides?.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides?.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides?.length) % heroSlides?.length);
  };

  if (loading) {
    return (
      <section className="relative h-screen overflow-hidden bg-gray-900 flex items-center justify-center">
        <Icon name="Loader2" size={48} className="animate-spin text-white" />
      </section>
    );
  }

  if (heroSlides.length === 0) {
    return (
      <section className="relative h-[60vh] md:h-screen overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center w-full max-w-none px-0">
        <div className="w-full px-3 md:px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-display font-medium text-foreground mb-4 md:mb-6">
            Welcome to BounceSteps
          </h1>
          <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8">
            Discover authentic travel experiences from verified local providers
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            {isServiceProvider ? (
              <>
                {/* Service Provider Buttons */}
                <Button 
                  variant="default" 
                  size="md"
                  className="text-sm md:text-base"
                  onClick={() => navigate('/service-provider-dashboard?tab=services')}
                >
                  <Icon name="Package" size={18} />
                  My Services
                </Button>
                <Button 
                  variant="outline" 
                  size="md"
                  className="text-sm md:text-base"
                  onClick={() => navigate('/service-provider-dashboard?tab=bookings')}
                >
                  <Icon name="Calendar" size={18} />
                  Bookings
                </Button>
              </>
            ) : (
              <>
                {/* Traveler Buttons */}
                <Link to="/journey-planner">
                  <Button variant="default" size="md" className="text-sm md:text-base">
                    <Icon name="Map" size={18} />
                    Start Your Journey
                  </Button>
                </Link>
                <Link to="/destination-discovery">
                  <Button variant="outline" size="md" className="text-sm md:text-base">
                    <Icon name="Compass" size={18} />
                    Explore Services
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    );
  }

  const currentService = heroSlides[currentSlide];

  return (
    <section className="relative h-[60vh] md:h-screen w-full max-w-none px-0 overflow-hidden bg-gray-900 border-b border-border shadow-sm">
      {/* Background Images */}
      <div className="absolute inset-0">
        {heroSlides?.map((slide, index) => (
          <div
            key={slide?.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {slide?.images && slide.images.length > 0 ? (
              <img
                src={slide.images[0]}
                alt={slide.title}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30" />
            )}
            <div className="absolute inset-0 bg-black/60 backdrop-brightness-95 md:bg-black/40"></div>
          </div>
        ))}
      </div>
      {/* Content Overlay */}
      <div className="relative z-10 h-full flex items-center justify-center md:justify-start">
        <div className="w-full px-3 md:max-w-7xl md:mx-auto md:px-6 lg:px-8">
          <div className="max-w-3xl flex flex-col items-center text-center md:items-start md:text-left">
            {/* Mobile: Compact badges layout */}
            <div className="mb-3 md:mb-6 flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs md:text-sm font-medium bg-accent/20 text-accent border border-accent/30">
                <Icon name="MapPin" size={14} className="mr-1" />
                <span className="truncate max-w-[120px] md:max-w-none">{currentService?.location}</span>
              </span>
              {currentService?.is_featured && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs md:text-sm font-medium bg-primary/20 text-primary border border-primary/30">
                  <Icon name="Star" size={14} className="mr-1" />
                  Featured
                </span>
              )}
            </div>
            
            {/* Mobile: Smaller title */}
            <h1 className="text-2xl sm:text-3xl md:text-6xl lg:text-7xl font-display font-medium text-white mb-2 md:mb-4 leading-tight tracking-tight">
              {currentService?.title}
            </h1>
            
            {/* Mobile: Shorter description */}
            <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-white/90 mb-3 md:mb-2 font-light max-h-12 md:max-h-none overflow-hidden">
              {currentService?.description || `Discover ${currentService?.category} services`}
            </p>
            
            {/* Mobile: Compact info layout */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-6 mb-4 md:mb-8 text-white/80">
              <div className="flex items-center">
                <Icon name="Tag" size={16} className="mr-1" />
                <span className="text-sm md:text-base lg:text-lg">{currentService?.category}</span>
              </div>
              <div className="flex items-center">
                <Icon name="DollarSign" size={16} className="mr-1" />
                <span className="text-sm md:text-base lg:text-lg font-medium">Tshs {parseFloat(currentService?.price || 0).toLocaleString()}/day</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 md:gap-4 mt-2 md:mt-8 w-full sm:w-auto px-2 sm:px-0">
              {/* Show different buttons based on user type */}
              {isServiceProvider ? (
                <>
                  {/* Service Provider Buttons - Mobile optimized */}
                  <Button 
                    variant="default" 
                    size="md" 
                    className="w-full sm:w-auto text-sm md:text-base"
                    onClick={() => navigate('/service-provider-dashboard?tab=services')}
                  >
                    <Icon name="Package" size={18} />
                    My Services
                  </Button>
                  <Button 
                    variant="outline" 
                    size="md" 
                    className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20 text-sm md:text-base"
                    onClick={() => navigate('/service-provider-dashboard?tab=bookings')}
                  >
                    <Icon name="Calendar" size={18} />
                    Bookings
                  </Button>
                </>
              ) : (
                <>
                  {/* Traveler Buttons - Mobile optimized */}
                  <Button 
                    variant="default" 
                    size="md" 
                    className="w-full sm:w-auto text-sm md:text-base"
                    onClick={() => {
                      // Check if user is logged in before booking - check isafari_user not token
                      const savedUser = localStorage.getItem('isafari_user');
                      if (!savedUser) {
                        navigate('/login?redirect=/');
                      } else {
                        // Add service to cart and navigate to cart & payments directly with payment modal open
                        const bookingItem = {
                          id: currentService.id,
                          name: currentService.title,
                          price: parseFloat(currentService.price || 0),
                          quantity: 1,
                          image: currentService.images && currentService.images.length > 0 ? currentService.images[0] : null,
                          description: currentService.description,
                          type: 'service',
                          category: currentService.category,
                          location: currentService.location,
                          provider_id: currentService.provider_id,
                          business_name: currentService.business_name
                        };
                        addToCart(bookingItem);
                        navigate('/traveler-dashboard?tab=cart&openPayment=true');
                      }
                    }}
                  >
                    <Icon name="Calendar" size={18} />
                    Book Now
                  </Button>
                  {/* Mobile: Show only essential buttons, hide extra ones on small screens */}
                  <div className="hidden sm:flex gap-2 md:gap-4">
                    <Link to="/journey-planner">
                      <Button variant="outline" size="md" className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-sm md:text-base">
                        <Icon name="Map" size={18} />
                        Plan Journey
                      </Button>
                    </Link>
                    <Link to="/destination-discovery">
                      <Button variant="outline" size="md" className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-sm md:text-base">
                        <Icon name="Compass" size={18} />
                        Explore
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Navigation Controls - Hidden on mobile for cleaner look */}
      <button
        onClick={prevSlide}
        className="hidden sm:flex absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full items-center justify-center text-white transition-all duration-300"
      >
        <Icon name="ChevronLeft" size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="hidden sm:flex absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full items-center justify-center text-white transition-all duration-300"
      >
        <Icon name="ChevronRight" size={24} />
      </button>
      {/* Slide Indicators - Mobile optimized */}
      <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {heroSlides?.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 md:h-2.5 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'w-6 md:w-8 bg-white' : 'w-2 md:w-2.5 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        cartItems={cartItems}
        total={getCartTotal()}
        onPaymentSuccess={(bookingData) => {
          setBooking(bookingData);
          setShowPayment(false);
        }}
      />
      
      {/* Booking Confirmation */}
      <BookingConfirmation
        booking={booking}
        onClose={() => {
          setBooking(null);
          navigate('/traveler-dashboard');
        }}
      />
    </section>
  );
};

export default HeroSection;