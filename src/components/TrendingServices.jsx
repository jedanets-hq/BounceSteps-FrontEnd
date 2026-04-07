import { ChevronLeft, ChevronRight, Star, MapPin, Clock, Users } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import Button from './ui/Button';
import Icon from './AppIcon';
import VerifiedBadge from './ui/VerifiedBadge';
import ProviderBadge from './ui/ProviderBadge';
import MessagingModal from './MessagingModal';
import { API_URL } from '../utils/api';

const TrendingServices = () => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [active, setActive] = useState(0);
  const [trendingServices, setTrendingServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServiceDetails, setSelectedServiceDetails] = useState(null);
  const [showMessaging, setShowMessaging] = useState(false);
  const [messagingProvider, setMessagingProvider] = useState(null);

  // Fetch trending services from backend
  useEffect(() => {
    const fetchTrendingServices = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_URL}/services/trending?limit=8`);
        const data = await response.json();
        
        console.log('Trending services API response:', data);
        
        if (data.success) {
          setTrendingServices(data.services);
        } else {
          console.error('API returned error:', data.message);
        }
      } catch (error) {
        console.error('Error fetching trending services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingServices();
  }, []);

  const scroll = (dir) => {
    if (scrollRef.current) {
      const cardWidth = window.innerWidth < 768 ? 180 : 400; // Smaller scroll for mobile
      scrollRef.current.scrollBy({ left: dir * cardWidth, behavior: "smooth" });
      
      // Update active indicator
      const maxIndex = Math.max(0, trendingServices.length - 3); // Show 3 dots max
      setActive((prev) => Math.max(0, Math.min(maxIndex, prev + dir)));
    }
  };

  // Format price
  const formatPrice = (price) => {
    if (!price) return 'Contact for price';
    return `TZS ${parseFloat(price).toLocaleString()}`;
  };

  // Add service to cart
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

  // Book Now - Direct payment with provider's payment methods
  const handleBookNow = async (service) => {
    const savedUser = localStorage.getItem('isafari_user');
    if (!savedUser) {
      navigate('/login?redirect=/');
      return;
    }
    
    // Store payment info for direct payment
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

  // Handle service click - show details modal
  const handleServiceClick = async (service) => {
    // Fetch full service details
    try {
      const response = await fetch(`${API_URL}/services/${service.id}`);
      const data = await response.json();
      
      if (data.success && data.service) {
        setSelectedServiceDetails(data.service);
      } else {
        setSelectedServiceDetails(service); // Fallback to basic service data
      }
    } catch (error) {
      console.error('Error fetching service details:', error);
      setSelectedServiceDetails(service); // Fallback to basic service data
    }
  };

  // Handle view all services
  const handleViewAllServices = () => {
    navigate('/destination-discovery');
  };
  const getServiceImage = (service) => {
    if (service.images && service.images.length > 0) {
      return service.images[0];
    }
    // Fallback image based on category
    const categoryImages = {
      'accommodation': '/hotel-placeholder.jpg',
      'transport': '/transport-placeholder.jpg',
      'tours': '/tour-placeholder.jpg',
      'activities': '/activity-placeholder.jpg',
      'dining': '/dining-placeholder.jpg',
      'shopping': '/shopping-placeholder.jpg'
    };
    return categoryImages[service.category?.toLowerCase()] || '/service-placeholder.jpg';
  };

  if (loading) {
    return (
      <section className="py-16 relative">
        <div className="w-full px-4 text-center relative z-10">
          <div className="max-w-full">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Top Ranking
            </h2>
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (trendingServices.length === 0) {
    return (
      <section className="py-16 relative">
        <div className="w-full px-4 text-center relative z-10">
          <div className="max-w-full">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Top Ranking
            </h2>
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                No top ranking services available at the moment. Check back soon!
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 relative bg-gradient-to-b from-background/50 to-background">
      <div className="w-full px-4 text-center relative z-10">
        <div className="max-w-full">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Top Ranking
          </h2>
          <p className="text-muted-foreground mb-10">
            Discover the most popular services approved by our community
          </p>

          <div className="relative max-w-7xl mx-auto">
            {/* Navigation Buttons */}
            {trendingServices.length > 3 && (
              <>
                <button
                  onClick={() => scroll(-1)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background shadow-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:shadow-xl transition-all duration-200"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  onClick={() => scroll(1)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background shadow-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:shadow-xl transition-all duration-200"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Services Carousel */}
            <div
              ref={scrollRef}
              className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide justify-start pl-4 md:pl-6 pr-4 md:pr-6 snap-x pb-4"
              style={{ scrollbarWidth: "none" }}
            >
              {trendingServices.map((service, index) => (
                <div
                  key={service.id}
                  onClick={() => handleServiceClick(service)}
                  className={`flex-shrink-0 w-[170px] md:w-[380px] rounded-2xl overflow-hidden shadow-lg bg-background/90 backdrop-blur-sm group cursor-pointer snap-start hover:shadow-xl transition-all duration-300 ${
                    index === trendingServices.length - 1 ? 'mr-8' : ''
                  }`}
                >
                  {/* Service Image */}
                  <div className="h-40 md:h-56 overflow-hidden relative">
                    <img
                      src={getServiceImage(service)}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      width={640}
                      height={512}
                      onError={(e) => {
                        e.target.src = '/service-placeholder.jpg';
                      }}
                    />
                    {/* TOP Badge */}
                    <div className="absolute top-3 right-3 bg-orange-500/90 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-xs font-semibold flex items-center gap-0.5 md:gap-1">
                      <Star size={10} className="md:w-3 md:h-3" fill="currentColor" />
                      <span className="text-xs md:text-xs">TOP</span>
                    </div>
                  </div>

                  {/* Service Info - Same structure as destinations */}
                  <div className="p-4 text-left">
                    <h3 className="font-bold text-foreground text-base md:text-lg">{service.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {service.description || `${service.category} service in Tanzania`}
                    </p>
                    {/* Price info */}
                    <p className="text-xs text-primary mt-2">
                      TZS {parseFloat(service.price || 0).toLocaleString()} per person
                    </p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServiceClick(service);
                      }}
                      className="mt-3 bg-primary text-primary-foreground px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-semibold hover:bg-accent transition-colors w-full md:w-auto"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Dots Indicator */}
            {trendingServices.length > 3 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {Array.from({ length: Math.min(3, Math.ceil(trendingServices.length / 3)) }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === active ? "bg-primary" : "bg-border"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* View All Button */}
          {trendingServices.length > 0 && (
            <div className="mt-8">
              <button 
                onClick={handleViewAllServices}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-accent transition-colors"
              >
                View All Services
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Service Details Modal */}
      {selectedServiceDetails && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedServiceDetails(null)}>
          <div className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Service Image */}
            <div className="relative h-64">
              {selectedServiceDetails.images && selectedServiceDetails.images.length > 0 ? (
                <img 
                  src={selectedServiceDetails.images[0]} 
                  alt={selectedServiceDetails.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                    <Icon name="Package" size={24} className="text-primary" />
                  </div>
                </div>
              )}
              <button 
                onClick={() => setSelectedServiceDetails(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <Icon name="X" size={20} />
              </button>
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {selectedServiceDetails.category}
                </span>
                {(selectedServiceDetails.provider_verified || selectedServiceDetails.is_verified) && (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Icon name="CheckCircle" size={14} />
                    Verified
                  </span>
                )}
                {selectedServiceDetails.provider_badge_type && (
                  <ProviderBadge badgeType={selectedServiceDetails.provider_badge_type} size="sm" showText={true} />
                )}
              </div>
            </div>

            {/* Service Details */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                {selectedServiceDetails.title}
                {(selectedServiceDetails.provider_verified || selectedServiceDetails.is_verified) && (
                  <VerifiedBadge size="sm" showText={false} inline={true} />
                )}
              </h2>
              
              <p className="text-muted-foreground flex items-center gap-1 mb-4">
                <Icon name="MapPin" size={16} />
                {selectedServiceDetails.location || selectedServiceDetails.area || selectedServiceDetails.district || selectedServiceDetails.region || 'Tanzania'}
              </p>

              <div className="flex items-center justify-between mb-6 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-2xl font-bold text-primary">TZS {parseFloat(selectedServiceDetails.price || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{selectedServiceDetails.duration || 'per day'}</p>
                </div>
                {selectedServiceDetails.average_rating > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <p className="text-xl font-bold flex items-center gap-1">
                      <Icon name="Star" size={18} className="text-yellow-500 fill-yellow-500" />
                      {parseFloat(selectedServiceDetails.average_rating).toFixed(1)}
                    </p>
                  </div>
                )}
              </div>

              {/* Service Details - Duration and Max Participants */}
              {(selectedServiceDetails.duration || selectedServiceDetails.max_participants) && (
                <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-3">Service Details</h3>
                  <div className="space-y-2">
                    {selectedServiceDetails.duration && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock size={16} />
                        <span>{selectedServiceDetails.duration}</span>
                      </div>
                    )}
                    {selectedServiceDetails.max_participants && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users size={16} />
                        <span>Up to {selectedServiceDetails.max_participants} people</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description - Always shown */}
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground">{selectedServiceDetails.description || 'No description available'}</p>
              </div>

              {/* Amenities */}
              {selectedServiceDetails.amenities && selectedServiceDetails.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-2">Amenities & Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedServiceDetails.amenities.map((amenity, index) => (
                      <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}



              {/* Contact Info */}
              {selectedServiceDetails?.contact_info && (selectedServiceDetails.contact_info.email?.enabled || selectedServiceDetails.contact_info.whatsapp?.enabled) && (
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-2">Contact Provider</h3>
                  <div className="flex gap-3">
                    {selectedServiceDetails.contact_info.whatsapp?.enabled && selectedServiceDetails.contact_info.whatsapp?.number && (
                      <a 
                        href={`https://wa.me/${selectedServiceDetails.contact_info.whatsapp.number.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Icon name="MessageCircle" size={16} className="mr-2" />
                        WhatsApp
                      </a>
                    )}
                    {selectedServiceDetails.contact_info.email?.enabled && selectedServiceDetails.contact_info.email?.address && (
                      <a 
                        href={`mailto:${selectedServiceDetails.contact_info.email.address}`}
                        className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors"
                      >
                        <Icon name="Mail" size={16} className="mr-2" />
                        Email
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Provider Info */}
              {(selectedServiceDetails.business_name || selectedServiceDetails.provider_name) && (
                <div 
                  className="mb-6 p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors border border-border"
                  onClick={() => {
                    if (selectedServiceDetails.provider_id) {
                      setSelectedServiceDetails(null);
                      navigate(`/provider/${selectedServiceDetails.provider_id}`);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon name="User" size={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">
                          {selectedServiceDetails.business_name || selectedServiceDetails.provider_name}
                        </p>
                        {(selectedServiceDetails.provider_verified || selectedServiceDetails.is_verified) && (
                          <VerifiedBadge size="sm" showText={false} inline={true} />
                        )}
                        {/* Provider Badge - next to provider name */}
                        {selectedServiceDetails.provider_badge_type && (
                          <ProviderBadge badgeType={selectedServiceDetails.provider_badge_type} size="sm" showText={false} />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">Tap to view all services from this provider</p>
                    </div>
                    <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="outline"
                  onClick={() => handleAddToCart(selectedServiceDetails)}
                  className="w-full sm:w-auto text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  <Icon name="ShoppingCart" size={14} />
                  <span className="ml-1">Add to Cart</span>
                </Button>
                <Button 
                  onClick={() => handleBookNow(selectedServiceDetails)}
                  className="w-full sm:w-auto text-sm dark:bg-primary dark:text-white dark:hover:bg-primary/80"
                >
                  <Icon name="CreditCard" size={14} />
                  <span className="ml-1">Book Now</span>
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    const savedUser = localStorage.getItem('isafari_user');
                    if (!savedUser) {
                      navigate('/login?redirect=/');
                      return;
                    }
                    
                    // Try provider_user_id first, fallback to provider_id
                    const providerId = selectedServiceDetails?.provider_user_id || selectedServiceDetails?.provider_id;
                    
                    if (!providerId) {
                      console.error('❌ [Chat Button] No provider ID found!', selectedServiceDetails);
                      alert('Error: Unable to start chat. Provider information is incomplete.');
                      return;
                    }
                    
                    setMessagingProvider({
                      id: providerId,
                      name: selectedServiceDetails.business_name || selectedServiceDetails.provider_name,
                      serviceId: selectedServiceDetails.id,
                      serviceName: selectedServiceDetails.title
                    });
                    setShowMessaging(true);
                    setSelectedServiceDetails(null);
                  }}
                  className="w-full sm:w-auto text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  <Icon name="MessageCircle" size={14} />
                  <span className="ml-1">Chat with Provider</span>
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