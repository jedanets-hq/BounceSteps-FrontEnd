import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import VerifiedBadge from '../../../components/ui/VerifiedBadge';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { PaymentModal, BookingConfirmation } from '../../../components/PaymentSystem';
import { API_URL } from '../../../utils/api';

const TrendingServices = () => {
  const navigate = useNavigate();
  const { addToCart, cartItems, getCartTotal } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [booking, setBooking] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      // Fetch only promoted trending services
      const response = await fetch(`${API_URL}/services?limit=6`);
      const data = await response.json();
      
      if (data.success && data.services.length > 0) {
        setServices(data.services);
      } else {
        // Fallback to regular services if no trending services are promoted
        const fallbackResponse = await fetch(`${API_URL}/services?limit=12`);
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.success) {
          setServices(fallbackData.services);
        }
      }
    } catch (err) {
      console.error('Error fetching trending services:', err);
    } finally {
      setLoading(false);
    }
  };

  // Use promoted trending services
  const trendingServices = services;

  const categories = [
    { id: 'all', name: 'All Services', icon: 'Grid' },
    { id: 'Transportation', name: 'Transportation', icon: 'Car' },
    { id: 'Accommodation', name: 'Accommodation', icon: 'Home' },
    { id: 'Tours & Activities', name: 'Tours & Activities', icon: 'Compass' }
  ];

  const filteredServices = selectedCategory === 'all' 
    ? trendingServices 
    : trendingServices.filter(service => service.category === selectedCategory);

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
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-3 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted border border-border'
              }`}
            >
              <Icon name={category.icon} size={16} />
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="Package" size={48} className="mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Services Available</h3>
            <p className="text-muted-foreground mb-6">Check back later for new services</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12">
            {filteredServices.map((service) => (
              <div key={service.id} className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5">
                  {service.images && service.images.length > 0 ? (
                    <img 
                      src={service.images[0]} 
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="Package" size={48} className="text-primary/40" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                      {service.category}
                    </span>
                    {service.is_featured && service.promotion_type === 'trending' && (
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Icon name="TrendingUp" size={12} />
                        Trending
                      </span>
                    )}
                  </div>
                  <div className="absolute top-4 right-4">
                    <button className="w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors">
                      <Icon name="Heart" size={16} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors flex items-center gap-2">
                        {service.title}
                        {(service.provider_verified || service.is_verified || service.verified) && (
                          <VerifiedBadge size="sm" showText={false} />
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Icon name="MapPin" size={14} />
                        {service.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">Tshs {parseFloat(service.price || 0).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">per day</div>
                    </div>
                  </div>

                  {service.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {service.description}
                    </p>
                  )}

                  {service.amenities && service.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {service.amenities.slice(0, 3).map((amenity, index) => (
                        <span key={index} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Payment Methods Display */}
                  {service?.payment_methods && Object.keys(service.payment_methods).some(key => service.payment_methods[key]?.enabled) && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {service.payment_methods.visa?.enabled && (
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">
                          <Icon name="CreditCard" size={10} className="mr-0.5" />
                          Card
                        </span>
                      )}
                      {service.payment_methods.paypal?.enabled && (
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">
                          PayPal
                        </span>
                      )}
                      {service.payment_methods.googlePay?.enabled && (
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px]">
                          GPay
                        </span>
                      )}
                      {service.payment_methods.mobileMoney?.enabled && (
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px]">
                          <Icon name="Smartphone" size={10} className="mr-0.5" />
                          M-Money
                        </span>
                      )}
                    </div>
                  )}

                  {/* Contact Buttons */}
                  {service?.contact_info && (service.contact_info.email?.enabled || service.contact_info.whatsapp?.enabled) && (
                    <div className="mb-3 flex gap-2">
                      {service.contact_info.whatsapp?.enabled && service.contact_info.whatsapp?.number && (
                        <a 
                          href={`https://wa.me/${service.contact_info.whatsapp.number.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Icon name="MessageCircle" size={12} className="mr-1" />
                          WhatsApp
                        </a>
                      )}
                      {service.contact_info.email?.enabled && service.contact_info.email?.address && (
                        <a 
                          href={`mailto:${service.contact_info.email.address}`}
                          className="inline-flex items-center px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Icon name="Mail" size={12} className="mr-1" />
                          Email
                        </a>
                      )}
                    </div>
                  )}

                  {/* Provider Profile Section */}
                  {(service.business_name || service.provider_name) && service.provider_id && (
                    <div 
                      className="mb-3 p-2 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (service.provider_id) {
                          navigate(`/provider/${service.provider_id}`);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Icon name="User" size={16} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground flex items-center gap-1">
                            {service.business_name || service.provider_name}
                            {(service.provider_verified || service.is_verified || service.verified) && <VerifiedBadge size="xs" showText={false} />}
                          </p>
                          <p className="text-xs text-muted-foreground">View Provider Profile</p>
                        </div>
                        <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedService(service)}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        // Check isafari_user not token
                        const savedUser = localStorage.getItem('isafari_user');
                        if (!savedUser) {
                          navigate('/login?redirect=/');
                        } else {
                          // Add to cart and navigate to cart & payments with payment modal open
                          const bookingItem = {
                            id: service.id,
                            name: service.title,
                            price: parseFloat(service.price || 0),
                            quantity: 1,
                            image: service.images && service.images.length > 0 ? service.images[0] : null,
                            description: service.description,
                            type: 'service',
                            category: service.category,
                            location: service.location,
                            provider_id: service.provider_id,
                            business_name: service.business_name
                          };
                          addToCart(bookingItem);
                          navigate('/traveler-dashboard?tab=cart&openPayment=true');
                        }
                      }}
                    >
                      <Icon name="Calendar" size={14} />
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedService(null)}>
          <div className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Service Image */}
            <div className="relative h-64">
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
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <Icon name="X" size={20} />
              </button>
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {selectedService.category}
                </span>
                {selectedService.provider_verified && (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Icon name="CheckCircle" size={14} />
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* Service Details */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                {selectedService.title}
                {selectedService.provider_verified && <VerifiedBadge size="sm" showText={false} />}
              </h2>
              
              <p className="text-muted-foreground flex items-center gap-1 mb-4">
                <Icon name="MapPin" size={16} />
                {selectedService.location || 'Tanzania'}
              </p>

              <div className="flex items-center justify-between mb-6 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-2xl font-bold text-primary">TZS {parseFloat(selectedService.price || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">per day</p>
                </div>
                {selectedService.average_rating > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <p className="text-xl font-bold flex items-center gap-1">
                      <Icon name="Star" size={18} className="text-yellow-500 fill-yellow-500" />
                      {parseFloat(selectedService.average_rating).toFixed(1)}
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground">{selectedService.description || 'No description available'}</p>
              </div>

              {/* Amenities */}
              {selectedService.amenities && selectedService.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-2">Amenities & Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedService.amenities.map((amenity, index) => (
                      <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Provider Info */}
              {(selectedService.business_name || selectedService.provider_name) && selectedService.provider_id && (
                <div 
                  className="mb-6 p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors border border-border"
                  onClick={() => {
                    if (selectedService.provider_id) {
                      setSelectedService(null);
                      navigate(`/provider/${selectedService.provider_id}`);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon name="User" size={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground flex items-center gap-1">
                        {selectedService.business_name || selectedService.provider_name}
                        {selectedService.provider_verified && <VerifiedBadge size="sm" showText={false} />}
                      </p>
                      <p className="text-sm text-muted-foreground">Tap to view all services from this provider</p>
                    </div>
                    <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    const savedUser = localStorage.getItem('isafari_user');
                    if (!savedUser) {
                      navigate('/login?redirect=/');
                      return;
                    }
                    const bookingItem = {
                      id: selectedService.id,
                      name: selectedService.title,
                      price: parseFloat(selectedService.price || 0),
                      quantity: 1,
                      image: selectedService.images && selectedService.images.length > 0 ? selectedService.images[0] : null,
                      description: selectedService.description,
                      type: 'service',
                      category: selectedService.category,
                      location: selectedService.location,
                      provider_id: selectedService.provider_id,
                      business_name: selectedService.business_name
                    };
                    addToCart(bookingItem);
                    setSelectedService(null);
                    navigate('/traveler-dashboard?tab=cart');
                  }}
                >
                  <Icon name="ShoppingBag" size={16} />
                  Add to Cart
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    const savedUser = localStorage.getItem('isafari_user');
                    if (!savedUser) {
                      navigate('/login?redirect=/');
                      return;
                    }
                    const bookingItem = {
                      id: selectedService.id,
                      name: selectedService.title,
                      price: parseFloat(selectedService.price || 0),
                      quantity: 1,
                      image: selectedService.images && selectedService.images.length > 0 ? selectedService.images[0] : null,
                      description: selectedService.description,
                      type: 'service',
                      category: selectedService.category,
                      location: selectedService.location,
                      provider_id: selectedService.provider_id,
                      business_name: selectedService.business_name
                    };
                    addToCart(bookingItem);
                    setSelectedService(null);
                    navigate('/traveler-dashboard?tab=cart&openPayment=true');
                  }}
                >
                  <Icon name="CreditCard" size={16} />
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TrendingServices;
