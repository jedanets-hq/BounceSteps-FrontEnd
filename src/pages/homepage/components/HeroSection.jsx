import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useCart } from '../../../contexts/CartContext';
import { PaymentModal, BookingConfirmation } from '../../../components/PaymentSystem';
import { API_URL } from '../../../utils/api';

const HeroSection = () => {
  const navigate = useNavigate();
  const { addToCart, cartItems, getCartTotal } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    fetchFeaturedServices();
  }, []);

  const fetchFeaturedServices = async () => {
    try {
      const response = await fetch(`${API_URL}/services/featured/slides`);
      const data = await response.json();
      
      if (data.success && data.slides.length > 0) {
        setFeaturedServices(data.slides);
      } else {
        // Fallback to regular services if no featured services
        const regularResponse = await fetch(`${API_URL}/services?limit=3`);
        const regularData = await regularResponse.json();
        if (regularData.success) {
          setFeaturedServices(regularData.services);
        }
      }
    } catch (err) {
      console.error('Error fetching featured services:', err);
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
      <section className="relative h-screen overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <h1 className="text-5xl lg:text-7xl font-display font-medium text-foreground mb-6">
            Welcome to iSafari Global
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Discover authentic travel experiences from verified local providers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="default" size="lg">
                <Icon name="UserPlus" size={20} />
                Start Your Journey
              </Button>
            </Link>
            <Link to="/services">
              <Button variant="outline" size="lg">
                <Icon name="Search" size={20} />
                Explore Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const currentService = heroSlides[currentSlide];

  return (
    <section className="relative h-screen sm:h-screen overflow-hidden bg-gray-900">
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
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        ))}
      </div>
      {/* Content Overlay */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <div className="mb-6 flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/20 text-accent border border-accent/30">
                <Icon name="MapPin" size={16} className="mr-2" />
                {currentService?.location}
              </span>
              {currentService?.is_currently_featured && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary border border-primary/30">
                  <Icon name="Star" size={16} className="mr-2" />
                  Featured
                </span>
              )}
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display font-medium text-white mb-4 leading-tight">
              {currentService?.title}
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-2 font-light">
              {currentService?.description || `Discover ${currentService?.category} services`}
            </p>
            
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6 mb-8 text-white/80">
              <div className="flex items-center">
                <Icon name="Tag" size={18} className="mr-2" />
                <span className="text-base sm:text-lg">{currentService?.category}</span>
              </div>
              <div className="flex items-center">
                <Icon name="DollarSign" size={18} className="mr-2" />
                <span className="text-base sm:text-lg font-medium">Tshs {parseFloat(currentService?.price || 0).toLocaleString()}/day</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="default" 
                size="lg" 
                className="w-full sm:w-auto"
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
                <Icon name="Calendar" size={20} />
                Book Now
              </Button>
              <Link to="/journey-planner">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Icon name="Map" size={20} />
                  Plan Your Journey
                </Button>
              </Link>
              <Link to="/destination-discovery">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Icon name="Compass" size={20} />
                  Explore Destinations
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Navigation Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-200"
      >
        <Icon name="ChevronLeft" size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-200"
      >
        <Icon name="ChevronRight" size={24} />
      </button>
      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {heroSlides?.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
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