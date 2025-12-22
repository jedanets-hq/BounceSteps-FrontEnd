import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import Icon from '../components/AppIcon';
import VerifiedBadge from '../components/ui/VerifiedBadge';
import { API_URL } from '../utils/api';

const DestinationDiscovery = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingService, setViewingService] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedServiceDetails, setSelectedServiceDetails] = useState(null);

  // Add service to cart
  const handleAddToCart = (service) => {
    const cartItem = {
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
      business_name: service.business_name || service.provider_name,
      payment_methods: service.payment_methods || {},
      contact_info: service.contact_info || {}
    };
    addToCart(cartItem);
    navigate('/traveler-dashboard?tab=cart');
  };

  // Direct payment with provider's payment methods
  const handleDirectPayment = (service) => {
    const cartItem = {
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
      business_name: service.business_name || service.provider_name,
      payment_methods: service.payment_methods || {},
      contact_info: service.contact_info || {}
    };
    
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
    
    addToCart(cartItem);
    navigate('/traveler-dashboard?tab=cart&openPayment=true&directPay=true');
  };

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    fetchServices();
  }, [selectedCategory, searchQuery]);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const response = await fetch(`${API_URL}/services?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setServices(data.services);
      } else {
        setError('Failed to load services');
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Real service categories from database - ALL CATEGORIES
  const categories = [
    { id: 'all', name: 'All Services', icon: 'Globe' },
    { id: 'Accommodation', name: 'Accommodation', icon: 'Home' },
    { id: 'Transportation', name: 'Transportation', icon: 'Car' },
    { id: 'Tours & Activities', name: 'Tours & Activities', icon: 'Compass' },
    { id: 'Food & Dining', name: 'Food & Dining', icon: 'Utensils' },
    { id: 'Shopping', name: 'Shopping', icon: 'ShoppingBag' },
    { id: 'Health & Wellness', name: 'Health & Wellness', icon: 'Heart' },
    { id: 'Entertainment', name: 'Entertainment', icon: 'Music' }
  ];

  // Services are already filtered by backend
  const filteredServices = services;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Image Viewer Modal */}
      {viewingService && viewingService.images && viewingService.images.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setViewingService(null)}>
          <div className="relative max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setViewingService(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <Icon name="X" size={32} />
            </button>
            
            <div className="relative bg-white rounded-lg overflow-hidden">
              <img 
                src={viewingService.images[currentImageIndex]} 
                alt={`${viewingService.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              
              {viewingService.images.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + viewingService.images.length) % viewingService.images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                  >
                    <Icon name="ChevronLeft" size={24} />
                  </button>
                  <button 
                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % viewingService.images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                  >
                    <Icon name="ChevronRight" size={24} />
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                    {currentImageIndex + 1} / {viewingService.images.length}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">
              Discover Your Next Adventure
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore amazing destinations across Tanzania and East Africa
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl">
              <Icon name="Search" size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="mb-8 flex flex-wrap gap-3">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-card border border-border text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={category.icon} size={16} />
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <Icon name="Loader2" size={48} className="mx-auto mb-4 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading services...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-destructive" />
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchServices} variant="outline">
                <Icon name="RefreshCw" size={16} />
                Try Again
              </Button>
            </div>
          )}

          {/* Services Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map(service => (
              <div key={service.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div 
                  className="relative h-48 cursor-pointer group"
                  onClick={() => {
                    if (service.images && service.images.length > 0) {
                      setViewingService(service);
                      setCurrentImageIndex(0);
                    }
                  }}
                >
                  {service.images && service.images.length > 0 ? (
                    <>
                      <img 
                        src={service.images[0]} 
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center gap-2">
                          <Icon name="Eye" size={16} />
                          <span className="text-sm font-medium">View Images</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <Icon name="Package" size={48} className="text-primary/40" />
                    </div>
                  )}
                  {service.images && service.images.length > 1 && (
                    <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                      <Icon name="Image" size={12} />
                      {service.images.length}
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <div className="flex items-center space-x-1">
                      <Icon name="Star" size={14} className="text-yellow-500" />
                      <span className="text-sm font-semibold">{service.average_rating || '5.0'}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium">
                    {service.category}
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">{service.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Icon name="MapPin" size={14} className="mr-1" />
                        {service.location}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {service.description}
                  </p>
                  
                  {service.amenities && service.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {service.amenities.slice(0, 2).map((amenity, idx) => (
                        <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
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
                        {service.payment_methods.mobileMoney?.enabled && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                            <Icon name="Smartphone" size={10} className="mr-1" />
                            M-Money
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <div className="text-2xl font-bold text-foreground">TZS {parseFloat(service.price || 0).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        by {service.provider_name || service.business_name}
                        {(service.provider_verified || service.is_verified) && (
                          <VerifiedBadge size="xs" showText={false} />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 mt-4">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedServiceDetails(service)}
                      >
                        <Icon name="Eye" size={14} />
                        View
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAddToCart(service)}
                      >
                        <Icon name="ShoppingCart" size={14} />
                        Add Cart
                      </Button>
                    </div>
                    <Button 
                      size="sm"
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={() => handleDirectPayment(service)}
                    >
                      <Icon name="CreditCard" size={16} />
                      Book Now & Pay
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}

          {!loading && !error && filteredServices.length === 0 && (
            <div className="text-center py-12">
              <Icon name="SearchX" size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No services found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
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
                  <Icon name="Package" size={64} className="text-primary/40" />
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
              </div>
            </div>

            {/* Service Details */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                {selectedServiceDetails.title}
                {(selectedServiceDetails.provider_verified || selectedServiceDetails.is_verified) && (
                  <VerifiedBadge size="sm" showText={false} />
                )}
              </h2>
              
              <p className="text-muted-foreground flex items-center gap-1 mb-4">
                <Icon name="MapPin" size={16} />
                {selectedServiceDetails.location || 'Tanzania'}
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

              {/* Description */}
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

              {/* Payment Methods */}
              {selectedServiceDetails?.payment_methods && Object.keys(selectedServiceDetails.payment_methods).some(key => selectedServiceDetails.payment_methods[key]?.enabled) && (
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-2">Accepted Payments</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedServiceDetails.payment_methods.visa?.enabled && (
                      <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        <Icon name="CreditCard" size={14} className="mr-1" />
                        Visa/Card
                      </span>
                    )}
                    {selectedServiceDetails.payment_methods.paypal?.enabled && (
                      <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        PayPal
                      </span>
                    )}
                    {selectedServiceDetails.payment_methods.mobileMoney?.enabled && (
                      <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        <Icon name="Smartphone" size={14} className="mr-1" />
                        Mobile Money
                      </span>
                    )}
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
                      <p className="font-semibold text-foreground flex items-center gap-1">
                        {selectedServiceDetails.business_name || selectedServiceDetails.provider_name}
                        {(selectedServiceDetails.provider_verified || selectedServiceDetails.is_verified) && (
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
                    handleAddToCart(selectedServiceDetails);
                    setSelectedServiceDetails(null);
                  }}
                >
                  <Icon name="ShoppingCart" size={16} />
                  Add to Cart
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    setSelectedServiceDetails(null);
                    handleDirectPayment(selectedServiceDetails);
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
