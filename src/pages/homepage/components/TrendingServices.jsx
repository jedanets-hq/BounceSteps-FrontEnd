import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import ProviderBadge from '../../../components/ui/ProviderBadge';
import VerifiedBadge from '../../../components/ui/VerifiedBadge';
import RatingStars from '../../../components/RatingStars';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useFavorites } from '../../../contexts/FavoritesContext';
import { PaymentModal, BookingConfirmation } from '../../../components/PaymentSystem';
import { servicesAPI } from '../../../utils/api';
import MessagingModal from '../../../components/MessagingModal';
import { SERVICE_CATEGORIES } from '../../../data/serviceCategories';
import ServiceCard from '../../../components/ServiceCard';

const TrendingServices = () => {
  const navigate = useNavigate();
  const { addToCart, cartItems, getCartTotal } = useCart();
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [booking, setBooking] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [favoriteLoading, setFavoriteLoading] = useState({});
  const [showMessaging, setShowMessaging] = useState(false);
  const [messagingProvider, setMessagingProvider] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      console.log('📡 [TrendingServices] Fetching trending services...');
      
      // Fetch ONLY trending services (is_trending = true)
      const data = await servicesAPI.getTrending({ limit: 12 });
      
      console.log('📦 [TrendingServices] Fetched data:', data);
      console.log('📦 [TrendingServices] Services count:', data.services?.length || 0);
      
      if (data.success && data.services && data.services.length > 0) {
        console.log('✅ [TrendingServices] Setting trending services:', data.services.length);
        setServices(data.services);
        console.log('✅ [TrendingServices] Trending services loaded successfully');
      } else {
        // NO FALLBACK - if no trending services, show empty
        console.warn('⚠️ [TrendingServices] No trending services found');
        setServices([]);
      }
    } catch (err) {
      console.error('❌ [TrendingServices] Error fetching services:', err);
      console.error('❌ [TrendingServices] Error details:', err.message);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // Use promoted trending services
  const trendingServices = services;

  // Handle favorite toggle
  const handleFavoriteToggle = async (e, service) => {
    e.stopPropagation();
    
    // Check if user is logged in
    const savedUser = localStorage.getItem('isafari_user');
    if (!savedUser) {
      navigate('/login?redirect=/');
      return;
    }

    const serviceId = service.id;
    if (!serviceId) {
      console.warn('Service has no id:', service);
      return;
    }

    // Set loading state for this specific service
    setFavoriteLoading(prev => ({ ...prev, [service.id]: true }));

    try {
      if (isFavorite('service', serviceId)) {
        // Remove from favorites
        const success = await removeFromFavorites('service', serviceId);
        if (success) {
          console.log('✅ Removed service from favorites:', service.title);
        }
      } else {
        // Add to favorites
        const success = await addToFavorites('service', serviceId);
        if (success) {
          console.log('✅ Added service to favorites:', service.title);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(prev => ({ ...prev, [service.id]: false }));
    }
  };

  const categories = SERVICE_CATEGORIES;

  const filteredServices = selectedCategory === 'all' 
    ? trendingServices 
    : trendingServices.filter(service => service.category === selectedCategory);

  // --- Touch & Carousel Logic ---
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Reset index when category changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedCategory]);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    // Using length - 1 for zero-indexed array, but we also consider that on desktop we might show multiple cards.
    // For simplicity, we just slide by 1.
    if (isLeftSwipe && currentIndex < filteredServices.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const nextSlide = () => {
    if (currentIndex < filteredServices.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const prevSlide = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };
  // --- End Logic ---

  const handleAddToCart = async (service) => {
    const savedUser = localStorage.getItem('isafari_user');
    if (!savedUser) {
      navigate('/login?redirect=/');
      return;
    }
    
    const result = await addToCart({
      id: service.id,
      serviceId: service.id,
      title: service.title,
      price: parseFloat(service.price || 0),
      quantity: 1
    });
    
    if (result.success) {
      alert(`✅ ${service.title} added to cart!`);
    } else {
      alert(`❌ ${result.message}`);
    }
  };

  const handleBookNow = async (service) => {
    const savedUser = localStorage.getItem('isafari_user');
    if (!savedUser) {
      navigate('/login?redirect=/');
      return;
    }
    
    localStorage.setItem('isafari_direct_payment', JSON.stringify({
      service_id: service.id,
      service_name: service.title,
      price: parseFloat(service.price || 0),
      provider_id: service.provider_id,
      business_name: service.business_name || service.provider_name,
      payment_methods: service.payment_methods || {},
      contact_info: service.contact_info || {}
    }));
    
    const result = await addToCart({
      id: service.id,
      serviceId: service.id,
      title: service.title,
      price: parseFloat(service.price || 0),
      quantity: 1
    });
    
    if (result.success) {
      navigate('/traveler-dashboard?tab=cart&openPayment=true');
    } else {
      alert(`❌ ${result.message}`);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Icon name="Loader2" size={48} className="mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading trending services...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-display font-medium text-foreground mb-6">
            Trending Services This Month
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the most popular experiences and services chosen by travelers like you. 
            Book authentic local experiences with verified providers.
          </p>
        </div>

        {/* Category Filter */}
        <div className="grid grid-cols-2 gap-2 max-w-5xl mx-auto sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-4 md:mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center justify-center space-x-2 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 sm:px-3 sm:py-3 sm:text-sm md:px-6 md:py-3 md:text-sm ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted border border-border'
              }`}
            >
              <Icon name={category.icon} size={16} className="shrink-0" />
              <span className="truncate">{category.name}</span>
            </button>
          ))}
        </div>

        {/* Services Slider */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="Package" size={48} className="mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Services Available</h3>
            <p className="text-muted-foreground mb-6">Check back later for new services</p>
          </div>
        ) : (
          <div className="relative group overflow-hidden px-1 py-4">
            
            {/* Desktop Navigation Arrows */}
            {currentIndex > 0 && (
              <button 
                onClick={prevSlide}
                className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full items-center justify-center text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
              >
                <Icon name="ChevronLeft" size={20} />
              </button>
            )}
            
            {currentIndex < filteredServices.length - 1 && (
              <button 
                onClick={nextSlide}
                className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full items-center justify-center text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
              >
                <Icon name="ChevronRight" size={20} />
              </button>
            )}

            {/* Carousel Container */}
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(calc(-${currentIndex} * min(85vw, 300px)))` }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {filteredServices.map((service, index) => (
                <div 
                  key={service.id} 
                  className="w-[85vw] flex-shrink-0 px-2 pb-4 sm:w-[300px] sm:px-3 sm:pb-4 md:w-[300px] md:px-3 md:pb-4"
                >
                  <ServiceCard 
                    service={service}
                    onViewDetails={(s) => setSelectedService(s)}
                    onAddToCart={handleAddToCart}
                    onBookNow={handleBookNow}
                    isFavorite={isFavorite('service', service.id)}
                    onToggleFavorite={handleFavoriteToggle}
                    favoriteLoading={favoriteLoading[service.id]}
                  />
                </div>
              ))}
            </div>
            {/* End Carousel Container */}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/destination-discovery')}
          >
            <Icon name="Search" size={16} />
            Explore All Services
          </Button>
        </div>
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

      {/* Service Details Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4 md:p-4" onClick={() => setSelectedService(null)}>
          <div className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Service Image */}
            <div className="relative h-48 sm:h-64 md:h-64">
              {selectedService.images && selectedService.images.length > 0 ? (
                <img 
                  src={selectedService.images[0]} 
                  alt={selectedService.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <Icon name="Package" size={64} className="text-primary/40" />
                </div>
              )}
              <button 
                onClick={() => setSelectedService(null)}
                className="absolute top-3 right-3 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors sm:top-4 sm:right-4 md:top-4 md:right-4"
              >
                <Icon name="X" size={20} />
              </button>
              <div className="absolute top-3 left-3 flex gap-2 sm:top-4 sm:left-4 md:top-4 md:left-4">
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium sm:px-3 sm:py-1 sm:text-sm md:px-3 md:py-1 md:text-sm">
                  {selectedService.category}
                </span>
                {selectedService.provider_verified && (
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 sm:px-3 sm:py-1 sm:text-sm md:px-3 md:py-1 md:text-sm">
                    <Icon name="CheckCircle" size={14} />
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* Service Details */}
            <div className="p-4 sm:p-6 md:p-6">
              <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2 sm:text-2xl md:text-2xl">
                {selectedService.title}
                {selectedService.provider_verified && <VerifiedBadge size="sm" showText={false} />}
              </h2>
              
              <p className="text-muted-foreground flex items-center gap-1 mb-4">
                <Icon name="MapPin" size={16} />
                {selectedService.location || 'Tanzania'}
              </p>

              <div className="flex items-center justify-between mb-4 p-3 bg-muted/30 rounded-lg sm:mb-6 sm:p-4 md:mb-6 md:p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-xl font-bold text-primary sm:text-2xl md:text-2xl">TZS {parseFloat(selectedService.price || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">per day</p>
                </div>
                {selectedService.average_rating > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <p className="text-lg font-bold flex items-center gap-1 sm:text-xl md:text-xl">
                      <Icon name="Star" size={18} className="text-yellow-500 fill-yellow-500" />
                      {parseFloat(selectedService.average_rating).toFixed(1)}
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-4 sm:mb-6 md:mb-6">
                <h3 className="font-semibold text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground text-sm sm:text-base md:text-base">{selectedService.description || 'No description available'}</p>
              </div>

              {/* Amenities */}
              {(() => {
                const amenities = Array.isArray(selectedService.amenities) 
                  ? selectedService.amenities 
                  : [];
                
                return amenities.length > 0 && (
                  <div className="mb-4 sm:mb-6 md:mb-6">
                    <h3 className="font-semibold text-foreground mb-2">Amenities & Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {amenities.map((amenity, index) => (
                        <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs sm:px-3 sm:py-1 sm:text-sm md:px-3 md:py-1 md:text-sm">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Provider Info */}
              {(selectedService.business_name || selectedService.provider_name) && selectedService.provider_id && (
                <div 
                  className="mb-4 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors border border-border sm:mb-6 sm:p-4 md:mb-6 md:p-4"
                  onClick={() => {
                    if (selectedService.provider_id) {
                      setSelectedService(null);
                      navigate(`/provider/${selectedService.provider_id}`);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center sm:w-12 sm:h-12 md:w-12 md:h-12">
                      <Icon name="User" size={20} className="text-primary sm:size-24 md:size-24" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground flex items-center gap-1 text-sm sm:text-base md:text-base">
                        {selectedService.business_name || selectedService.provider_name}
                        {selectedService.provider_badge_type && <ProviderBadge badgeType={selectedService.provider_badge_type} size="sm" showText={false} />}
                      </div>
                      <p className="text-xs text-muted-foreground sm:text-sm md:text-sm">Tap to view all services from this provider</p>
                    </div>
                    <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  className="flex-1 py-3 text-sm font-semibold rounded-lg sm:flex-1 sm:py-3 sm:text-sm md:flex-1"
                  onClick={() => {
                    const savedUser = localStorage.getItem('isafari_user');
                    if (!savedUser) {
                      navigate('/login?redirect=/');
                      return;
                    }
                    
                    console.log('🔍 [Chat Button - TrendingServices] Service data:', {
                      provider_user_id: selectedService?.provider_user_id,
                      provider_id: selectedService?.provider_id,
                      business_name: selectedService?.business_name,
                      service_id: selectedService?.id
                    });
                    
                    if (!selectedService?.provider_user_id) {
                      console.error('❌ [Chat Button] provider_user_id is missing!');
                      alert('Error: Unable to start chat. Provider information is incomplete.');
                      return;
                    }
                    
                    setMessagingProvider({
                      id: selectedService.provider_user_id, // Always use provider_user_id
                      name: selectedService.business_name || selectedService.provider_name,
                      serviceId: selectedService.id,
                      serviceName: selectedService.title
                    });
                    setShowMessaging(true);
                    setSelectedService(null);
                  }}
                >
                  <Icon name="MessageCircle" size={16} />
                  Chat with Provider
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messaging Modal */}
      <MessagingModal
        isOpen={showMessaging}
        onClose={() => {
          setShowMessaging(false);
          setMessagingProvider(null);
        }}
        providerId={messagingProvider?.id}
        providerName={messagingProvider?.name}
        serviceId={messagingProvider?.serviceId}
        serviceName={messagingProvider?.serviceName}
      />
    </section>
  );
};

export default TrendingServices;
