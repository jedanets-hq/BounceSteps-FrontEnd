import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import Image from '../../components/AppImage';
import ProviderBadge from '../../components/ui/ProviderBadge';
import CartSidebar from '../../components/CartSidebar';
import { PaymentModal, BookingConfirmation } from '../../components/PaymentSystem';
import ServiceDetailsModal from '../../components/ServiceDetailsModal';
import { useCart } from '../../contexts/CartContext';
import { bookingsAPI, API_BASE_URL } from '../../utils/api';
import MessagingModal from '../../components/MessagingModal';

const ProviderProfile = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems, getCartTotal } = useCart();
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [booking, setBooking] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedService, setSelectedService] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [showServiceDetailsModal, setShowServiceDetailsModal] = useState(false);
  const [selectedServiceForDetails, setSelectedServiceForDetails] = useState(null);
  const [showMessaging, setShowMessaging] = useState(false);
  const [messagingProvider, setMessagingProvider] = useState(null);

  useEffect(() => {
    fetchProviderData();
    checkFollowStatus();
    fetchFollowerCount();
  }, [providerId]);

  // Listen for messaging events from ServiceDetailsModal
  useEffect(() => {
    const handleOpenMessaging = (event) => {
      const { providerId, providerName, serviceId, serviceName } = event.detail;
      setMessagingProvider({
        id: providerId,
        name: providerName,
        serviceId: serviceId,
        serviceName: serviceName
      });
      setShowMessaging(true);
    };

    window.addEventListener('openMessaging', handleOpenMessaging);
    return () => window.removeEventListener('openMessaging', handleOpenMessaging);
  }, []);

  const checkFollowStatus = () => {
    const followedProviders = JSON.parse(localStorage.getItem('followed_providers') || '[]');
    setIsFollowing(followedProviders.includes(parseInt(providerId)));
  };

  const fetchFollowerCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/providers/${providerId}/followers/count`);
      const data = await response.json();
      if (data.success) {
        setFollowerCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching follower count:', error);
    }
  };

  const handleFollowToggle = async () => {
    try {
      setLoadingFollow(true);
      
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      if (!token) {
        navigate('/login');
        return;
      }

      const endpoint = isFollowing ? 'unfollow' : 'follow';
      const response = await fetch(`${API_BASE_URL}/providers/${providerId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setIsFollowing(!isFollowing);
        setFollowerCount(data.followers_count);
        
        // Update localStorage for quick access
        const followedProviders = JSON.parse(localStorage.getItem('followed_providers') || '[]');
        if (isFollowing) {
          // Remove from followed
          const updated = followedProviders.filter(id => id !== parseInt(providerId));
          localStorage.setItem('followed_providers', JSON.stringify(updated));
        } else {
          // Add to followed
          localStorage.setItem('followed_providers', JSON.stringify([...followedProviders, parseInt(providerId)]));
        }
        
        alert(data.message || (isFollowing ? '✅ Unfollowed successfully' : '✅ Following successfully'));
      } else {
        alert('❌ ' + (data.message || 'Failed to update follow status'));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert('❌ Error updating follow status. Please try again.');
    } finally {
      setLoadingFollow(false);
    }
  };

  const fetchProviderData = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Fetching provider data for ID:', providerId);
      
      // Check if providerId is valid
      if (!providerId || providerId === 'undefined' || providerId === 'null') {
        console.error('❌ Invalid provider ID:', providerId);
        setLoading(false);
        return;
      }

      // Fetch provider details with cache-busting
      const timestamp = new Date().getTime();
      const url = `${API_BASE_URL}/providers/${providerId}?_t=${timestamp}`;
      console.log('📡 Fetching from:', url);
      
      const providerResponse = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log('📊 Response status:', providerResponse.status);
      
      const providerData = await providerResponse.json();
      
      console.log('📦 Provider data:', providerData);
      
      if (providerData.success && providerData.provider) {
        setProvider(providerData.provider);
        
        // If provider has services included, use them
        if (providerData.provider.services && providerData.provider.services.length > 0) {
          setServices(providerData.provider.services);
          console.log('✅ Loaded services from provider data:', providerData.provider.services.length);
        } else {
          // Provider exists but has no services - set empty array
          setServices([]);
          console.log('✅ Provider found but has no services yet');
        }
      } else {
        console.error('❌ Provider not found or error:', providerData);
        setProvider(null);
        setServices([]);
      }
    } catch (error) {
      console.error('❌ Error fetching provider data:', error);
      setProvider(null);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (service) => {
    const result = await addToCart({
      id: service.id,
      serviceId: service.id,
      title: service.title,
      price: parseFloat(service.price || 0),
      quantity: 1
    });
    
    if (result.success) {
      alert(`✅ ${service.title} added to cart!`);
      return true;
    } else {
      alert(`❌ ${result.message}`);
      return false;
    }
  };

  const handleBookNow = async (service) => {
    const savedUser = localStorage.getItem('isafari_user');
    if (!savedUser) {
      navigate('/login?redirect=/provider/' + providerId);
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
      navigate('/traveler-dashboard?tab=cart&openPayment=true');
    } else {
      alert(`❌ ${result.message}`);
    }
  };

  const handleServiceToggle = (serviceId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  // Get unique categories from services
  const categories = ['all', ...new Set(services.map(s => s.category).filter(Boolean))];

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <Icon name="Loader2" size={48} className="mx-auto text-primary mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading provider profile...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!provider && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <Icon name="ArrowLeft" size={20} />
              <span>Back</span>
            </button>
            <div className="text-center py-12">
              <Icon name="UserX" size={48} className="mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Provider Not Found</h2>
              <p className="text-muted-foreground mb-4">The provider you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => navigate('/destination-discovery')}>
                <Icon name="Search" size={16} />
                Browse Services
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <Icon name="ArrowLeft" size={20} />
            <span>Back</span>
          </button>

          {/* Provider Header */}
          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="Building2" size={48} className="text-primary" />
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2 mb-2">
                  {provider?.business_name || provider?.name || 'Service Provider'}
                  {provider?.badge_type && <ProviderBadge badgeType={provider.badge_type} size="lg" showText={false} />}
                </h1>
                
                {provider?.location && (
                  <p className="text-muted-foreground flex items-center gap-2 mb-2">
                    <Icon name="MapPin" size={18} />
                    {provider.location}
                  </p>
                )}
                
                {/* Detailed Location Data */}
                {provider?.location_data && Object.keys(provider.location_data).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {provider.location_data.region && (
                      <span className="inline-flex items-center px-2 py-1 bg-muted/30 text-muted-foreground rounded text-xs">
                        <Icon name="MapPin" size={12} className="mr-1" />
                        {provider.location_data.region}
                      </span>
                    )}
                    {provider.location_data.district && (
                      <span className="inline-flex items-center px-2 py-1 bg-muted/30 text-muted-foreground rounded text-xs">
                        {provider.location_data.district}
                      </span>
                    )}
                    {provider.location_data.ward && (
                      <span className="inline-flex items-center px-2 py-1 bg-muted/30 text-muted-foreground rounded text-xs">
                        {provider.location_data.ward}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Service Categories */}
                {provider?.service_categories && provider.service_categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {provider.service_categories.map((category, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                        <Icon name="Briefcase" size={14} className="mr-1" />
                        {category}
                      </span>
                    ))}
                  </div>
                )}
                
                {provider?.description && (
                  <p className="text-muted-foreground mb-4">{provider.description}</p>
                )}
                
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Package" size={16} className="text-primary" />
                    <span className="font-medium">{services.length}</span>
                    <span className="text-muted-foreground">Services</span>
                  </div>
                  
                  {provider?.average_rating > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="Star" size={16} className="text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{parseFloat(provider.average_rating).toFixed(1)}</span>
                      <span className="text-muted-foreground">Rating</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {/* Follower Count */}
                <div className="text-center mb-2">
                  <p className="text-2xl font-bold text-foreground">{followerCount}</p>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                
                {/* Follow Button */}
                <Button
                  variant={isFollowing ? 'default' : 'outline'}
                  onClick={handleFollowToggle}
                  disabled={loadingFollow}
                  className="min-w-[120px]"
                >
                  {loadingFollow ? (
                    <Icon name="Loader2" size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Icon name={isFollowing ? 'UserCheck' : 'UserPlus'} size={16} />
                      {isFollowing ? 'Following' : 'Follow'}
                    </>
                  )}
                </Button>
                
                {/* Add to Favorite Button - USE API */}
                <Button
                  variant="outline"
                  onClick={async () => {
                    const savedUser = localStorage.getItem('isafari_user');
                    if (!savedUser) {
                      navigate('/login?redirect=/provider/' + providerId);
                      return;
                    }
                    
                    const userData = JSON.parse(savedUser);
                    const token = userData.token;
                    
                    try {
                      // Use /add endpoint with correct providerId
                      const response = await fetch(`${API_BASE_URL}/favorites/add`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ providerId: parseInt(providerId) })
                      });
                      
                      const data = await response.json();
                      
                      if (data.success) {
                        alert('✅ Added to favorites!');
                      } else {
                        alert('❌ ' + (data.message || 'Failed to add to favorites'));
                      }
                    } catch (error) {
                      console.error('Error managing favorites:', error);
                      alert('❌ Error. Please try again.');
                    }
                  }}
                >
                  <Icon name="Heart" size={18} className="mr-2" />
                  Add to Favorite
                </Button>
                
                {provider?.whatsapp && (
                  <a 
                    href={`https://wa.me/${provider.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Icon name="MessageCircle" size={18} className="mr-2" />
                    WhatsApp
                  </a>
                )}
                {provider?.phone && (
                  <a 
                    href={`tel:${provider.phone}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Icon name="Phone" size={18} className="mr-2" />
                    {provider.phone}
                  </a>
                )}
                {provider?.email && (
                  <a 
                    href={`mailto:${provider.email}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Icon name="Mail" size={18} className="mr-2" />
                    Email
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {category === 'all' ? 'All Services' : category}
                </button>
              ))}
            </div>
          )}

          {/* Services Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Services by {provider?.business_name || 'this Provider'}
            </h2>
            
            {filteredServices.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No services available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <div key={service.id} className="bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-border">
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
                    </div>
                    
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-foreground mb-2">{service.title}</h3>
                      
                      <p className="text-muted-foreground text-sm mb-2 flex items-center gap-1">
                        <Icon name="MapPin" size={14} />
                        {service.location || 'Tanzania'}
                      </p>
                      
                      {service.description && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{service.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-xl font-bold text-primary">TZS {parseFloat(service.price || 0).toLocaleString()}</p>
                        {service.average_rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Icon name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium">{parseFloat(service.average_rating).toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {/* Payment Methods */}
                      {service?.payment_methods && Object.keys(service.payment_methods).some(key => service.payment_methods[key]?.enabled) && (
                        <div className="mb-3 flex flex-wrap gap-1">
                          {service.payment_methods.visa?.enabled && (
                            <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                              <Icon name="CreditCard" size={10} className="mr-1" />
                              Card
                            </span>
                          )}
                          {service.payment_methods.mobileMoney?.enabled && (
                            <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                              <Icon name="Smartphone" size={10} className="mr-1" />
                              M-Money
                            </span>
                          )}
                        </div>
                      )}
                      
                       <div className="flex flex-col gap-2">
                        <Button 
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            console.log('🔍 [View Details Button Clicked] Service data:', {
                              id: service?.id,
                              title: service?.title,
                              provider_user_id: service?.provider_user_id,
                              provider_id: service?.provider_id,
                              business_name: service?.business_name,
                              all_keys: Object.keys(service || {}),
                              full_service: service
                            });
                            console.log('🔍 [View Details] Provider data:', {
                              user_id: provider?.user_id,
                              id: provider?.id,
                              business_name: provider?.business_name,
                              all_keys: Object.keys(provider || {})
                            });
                            setSelectedServiceForDetails(service);
                            setShowServiceDetailsModal(true);
                          }}
                        >
                          <Icon name="Eye" size={16} />
                          View Details
                        </Button>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={async () => {
                              const savedUser = localStorage.getItem('isafari_user');
                              if (!savedUser) {
                                navigate('/login?redirect=/provider/' + providerId);
                                return;
                              }
                              await handleAddToCart(service);
                            }}
                          >
                            <Icon name="ShoppingCart" size={14} className="mr-1" />
                            Add to Cart
                          </Button>
                          <Button 
                            size="sm"
                            className="flex-1 bg-primary hover:bg-primary/90"
                            onClick={() => handleBookNow(service)}
                          >
                            <Icon name="CreditCard" size={14} className="mr-1" />
                            Book Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              <div className="absolute top-4 left-4">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {selectedService.category}
                </span>
              </div>
            </div>

            {/* Service Details */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">{selectedService.title}</h2>
              
              <p className="text-muted-foreground flex items-center gap-1 mb-4">
                <Icon name="MapPin" size={16} />
                {selectedService.location || 'Tanzania'}
              </p>

              <div className="flex items-center justify-between mb-6 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-2xl font-bold text-primary">TZS {parseFloat(selectedService.price || 0).toLocaleString()}</p>
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
                    {selectedService.payment_methods.mobileMoney?.enabled && (
                      <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        <Icon name="Smartphone" size={14} className="mr-1" />
                        Mobile Money
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center">
                <Button 
                  size="lg"
                  onClick={() => {
                    const savedUser = localStorage.getItem('isafari_user');
                    if (!savedUser) {
                      navigate('/login?redirect=/provider/' + providerId);
                      return;
                    }
                    
                    console.log('🔍 [Chat Button] Provider data:', {
                      provider_user_id: provider?.user_id,
                      provider_id: providerId,
                      provider_business_name: provider?.business_name,
                      selected_service_id: selectedService?.id,
                      selected_service_title: selectedService?.title
                    });
                    
                    if (!provider?.user_id) {
                      console.error('❌ [Chat Button] provider.user_id is missing!');
                      alert('Error: Unable to start chat. Provider information is incomplete.');
                      return;
                    }
                    
                    setMessagingProvider({
                      id: provider.user_id, // Always use user_id from provider object
                      name: provider?.business_name || provider?.name,
                      serviceId: selectedService.id,
                      serviceName: selectedService.title
                    });
                    setShowMessaging(true);
                    setSelectedService(null);
                  }}
                >
                  <Icon name="MessageCircle" size={20} />
                  Chat with Provider
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ServiceDetailsModal
        isOpen={showServiceDetailsModal}
        onClose={() => setShowServiceDetailsModal(false)}
        service={selectedServiceForDetails}
        providerInfo={provider}
      />
    </div>
  );
};

export default ProviderProfile;
