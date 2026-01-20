import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import Image from '../../components/AppImage';
import VerifiedBadge from '../../components/ui/VerifiedBadge';
import CartSidebar from '../../components/CartSidebar';
import { PaymentModal, BookingConfirmation } from '../../components/PaymentSystem';
import { API_URL } from '../../utils/api';

const DestinationDiscovery = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart, cartItems, getCartTotal } = useCart();
  const [showPayment, setShowPayment] = useState(false);
  const [booking, setBooking] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);

  // Service categories from database
  const categories = [
    { id: 'all', name: 'All Services', icon: 'Globe' },
    { id: 'Accommodation', name: 'Accommodation', icon: 'Building' },
    { id: 'Transportation', name: 'Transportation', icon: 'Car' },
    { id: 'Tours & Activities', name: 'Tours & Activities', icon: 'Camera' },
    { id: 'Food & Dining', name: 'Food & Dining', icon: 'Utensils' },
    { id: 'Shopping', name: 'Shopping', icon: 'ShoppingBag' },
    { id: 'Health & Wellness', name: 'Health & Wellness', icon: 'Heart' },
    { id: 'Entertainment', name: 'Entertainment', icon: 'Music' }
  ];

  // Fetch services from database
  useEffect(() => {
    fetchServices();
  }, [selectedCategory]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/services?limit=50`;
      if (selectedCategory !== 'all') {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      
      console.log('🌐 [DESTINATION DISCOVERY] Fetching from:', url);
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.services) {
        // Get followed providers from localStorage
        const followedProviderIds = JSON.parse(localStorage.getItem('followed_providers') || '[]');
        
        // Sort services - followed providers' services first
        const sortedServices = [...data.services].sort((a, b) => {
          const aIsFollowed = followedProviderIds.includes(a.provider_id);
          const bIsFollowed = followedProviderIds.includes(b.provider_id);
          
          if (aIsFollowed && !bIsFollowed) return -1;
          if (!aIsFollowed && bIsFollowed) return 1;
          return 0;
        });
        
        setServices(sortedServices);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = (service) => {
    const bookingItem = {
      id: service.id,
      name: service.title,
      price: parseFloat(service.price || 0),
      quantity: 1,
      image: service.images && service.images.length > 0 ? service.images[0] : null,
      description: service.description,
      duration: service.duration,
      rating: service.average_rating,
      type: 'service',
      category: service.category,
      location: service.location,
      provider_id: service.provider_id,
      business_name: service.business_name,
      payment_methods: service.payment_methods || {},
      contact_info: service.contact_info || {}
    };
    
    addToCart(bookingItem);
  };

  // Handle direct payment with service provider's payment methods
  const handleDirectPayment = (service) => {
    const savedUser = localStorage.getItem('isafari_user');
    if (!savedUser) {
      navigate('/login?redirect=/destination-discovery');
      return;
    }
    
    // Store service payment info in localStorage for payment page
    const paymentInfo = {
      service_id: service.id,
      service_name: service.title,
      price: parseFloat(service.price || 0),
      provider_id: service.provider_id,
      business_name: service.business_name,
      payment_methods: service.payment_methods || {},
      contact_info: service.contact_info || {}
    };
    localStorage.setItem('isafari_direct_payment', JSON.stringify(paymentInfo));
    
    handleBookService(service);
    navigate('/traveler-dashboard?tab=cart&openPayment=true&directPay=true');
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-display font-medium text-foreground mb-4">
              Discover Amazing Services
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore services from verified providers, each offering unique experiences and unforgettable memories
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Icon name={category.icon} size={16} />
                <span>{category.name}</span>
              </button>
            ))}
          </div>


          {/* Services Grid */}
          {loading ? (
            <div className="text-center py-12">
              <Icon name="Loader2" size={48} className="mx-auto text-primary mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading services...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service) => (
                <div key={service.id} className="bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-48">
                    {service.images && service.images.length > 0 ? (
                      <Image
                        src={service.images[0]}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <Icon name="Package" size={48} className="text-primary/40" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                      {service.category}
                    </div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium">
                      ⭐ {parseFloat(service.average_rating || 0).toFixed(1)}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                      {service.title}
                      {(service.provider_verified || service.is_verified || service.verified || service.verification_status === 'verified') && (
                        <VerifiedBadge size="sm" showText={false} />
                      )}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-2 flex items-center gap-1">
                      <Icon name="MapPin" size={14} />
                      {service.location || 'Tanzania'}
                    </p>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{service.description}</p>
                    
                    {service.amenities && service.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {service.amenities.slice(0, 3).map((amenity, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Payment Methods Display */}
                    {service?.payment_methods && Object.keys(service.payment_methods).some(key => service.payment_methods[key]?.enabled) && (
                      <div className="mb-3 p-2 bg-muted/30 rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Accepted Payments:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {service.payment_methods.visa?.enabled && (
                            <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                              <Icon name="CreditCard" size={10} className="mr-1" />
                              Visa/Card
                            </span>
                          )}
                          {service.payment_methods.paypal?.enabled && (
                            <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                              PayPal
                            </span>
                          )}
                          {service.payment_methods.googlePay?.enabled && (
                            <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                              GPay
                            </span>
                          )}
                          {service.payment_methods.mobileMoney?.enabled && (
                            <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                              <Icon name="Smartphone" size={10} className="mr-1" />
                              M-Money
                            </span>
                          )}
                        </div>
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
                            className="inline-flex items-center px-2.5 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Icon name="MessageCircle" size={12} className="mr-1" />
                            WhatsApp
                          </a>
                        )}
                        {service.contact_info.email?.enabled && service.contact_info.email?.address && (
                          <a 
                            href={`mailto:${service.contact_info.email.address}`}
                            className="inline-flex items-center px-2.5 py-1 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Icon name="Mail" size={12} className="mr-1" />
                            Email
                          </a>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-lg font-semibold text-foreground">TZS {parseFloat(service.price || 0).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{service.duration || 'per day'}</p>
                      </div>
                    </div>

                    {/* Provider Profile Section */}
                    {(service.business_name || service.provider_name || service.provider_id) && (
                      <div 
                        className="mb-4 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors border border-border hover:border-primary/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (service.provider_id) {
                            navigate(`/provider/${service.provider_id}`);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Icon name="User" size={20} className="text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                              {service.business_name || service.provider_name || 'Service Provider'}
                              {(service.provider_verified || service.is_verified || service.verified || service.verification_status === 'verified') && (
                                <VerifiedBadge size="xs" showText={false} />
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">Tap to view provider profile & all services</p>
                          </div>
                          <Icon name="ChevronRight" size={18} className="text-primary" />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setSelectedService(service)}
                        >
                          <Icon name="Eye" size={14} className="mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            const savedUser = localStorage.getItem('isafari_user');
                            if (!savedUser) {
                              navigate('/login?redirect=/destination-discovery');
                              return;
                            }
                            handleBookService(service);
                            navigate('/traveler-dashboard?tab=cart');
                          }}
                        >
                          <Icon name="ShoppingCart" size={14} className="mr-1" />
                          Add Cart
                        </Button>
                      </div>
                      <Button 
                        onClick={() => handleDirectPayment(service)}
                        size="sm"
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        <Icon name="CreditCard" size={16} className="mr-1" />
                        Book Now & Pay
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredServices.length === 0 && (
            <div className="text-center py-12">
              <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No services found</h3>
              <p className="text-muted-foreground">Try adjusting your search or category filter</p>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="bg-primary/5 rounded-lg p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Can't find what you're looking for?
              </h2>
              <p className="text-muted-foreground mb-6">
                Our travel experts can help you discover hidden gems and create custom itineraries
              </p>
              <Link to="/journey-planner">
                <Button size="lg">
                  <Icon name="MessageCircle" size={20} />
                  Speak with an Expert
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <CartSidebar onCheckout={() => setShowPayment(true)} />
      
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
      
      <BookingConfirmation
        booking={booking}
        onClose={() => {
          setBooking(null);
        }}
      />

      {/* Service Details Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedService(null)}>
          <div className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Service Image */}
            <div className="relative h-64">
              {selectedService.images && selectedService.images.length > 0 ? (
                <Image 
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
                {(selectedService.provider_verified || selectedService.is_verified || selectedService.verified || selectedService.verification_status === 'verified') && (
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
                {(selectedService.provider_verified || selectedService.is_verified || selectedService.verified || selectedService.verification_status === 'verified') && (
                  <VerifiedBadge size="sm" showText={false} />
                )}
              </h2>
              
              <p className="text-muted-foreground flex items-center gap-1 mb-4">
                <Icon name="MapPin" size={16} />
                {selectedService.location || 'Tanzania'}
              </p>

              <div className="flex items-center justify-between mb-6 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-2xl font-bold text-primary">TZS {parseFloat(selectedService.price || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{selectedService.duration || 'per day'}</p>
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

              {/* Payment Methods */}
              {selectedService?.payment_methods && Object.keys(selectedService.payment_methods).some(key => selectedService.payment_methods[key]?.enabled) && (
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-2">Accepted Payments</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedService.payment_methods.visa?.enabled && (
                      <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        <Icon name="CreditCard" size={14} className="mr-1" />
                        Visa/Card
                      </span>
                    )}
                    {selectedService.payment_methods.paypal?.enabled && (
                      <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        PayPal
                      </span>
                    )}
                    {selectedService.payment_methods.googlePay?.enabled && (
                      <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        Google Pay
                      </span>
                    )}
                    {selectedService.payment_methods.mobileMoney?.enabled && (
                      <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        <Icon name="Smartphone" size={14} className="mr-1" />
                        Mobile Money
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              {selectedService?.contact_info && (selectedService.contact_info.email?.enabled || selectedService.contact_info.whatsapp?.enabled) && (
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-2">Contact Provider</h3>
                  <div className="flex gap-3">
                    {selectedService.contact_info.whatsapp?.enabled && selectedService.contact_info.whatsapp?.number && (
                      <a 
                        href={`https://wa.me/${selectedService.contact_info.whatsapp.number.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Icon name="MessageCircle" size={16} className="mr-2" />
                        WhatsApp
                      </a>
                    )}
                    {selectedService.contact_info.email?.enabled && selectedService.contact_info.email?.address && (
                      <a 
                        href={`mailto:${selectedService.contact_info.email.address}`}
                        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <Icon name="Mail" size={16} className="mr-2" />
                        Email
                      </a>
                    )}
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
                        {(selectedService.provider_verified || selectedService.is_verified || selectedService.verified || selectedService.verification_status === 'verified') && (
                          <VerifiedBadge size="sm" showText={false} />
                        )}
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
                      navigate('/login?redirect=/destination-discovery');
                      return;
                    }
                    handleBookService(selectedService);
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
                    setSelectedService(null);
                    handleDirectPayment(selectedService);
                  }}
                >
                  <Icon name="CreditCard" size={16} />
                  Book Now & Pay
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DestinationDiscovery;
