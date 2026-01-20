import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import VerifiedBadge from '../../../components/ui/VerifiedBadge';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { PaymentModal, BookingConfirmation } from '../../../components/PaymentSystem';
import { API_URL } from '../../../utils/api';

const TransportationHub = () => {
  const navigate = useNavigate();
  const { addToCart, cartItems, getCartTotal } = useCart();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    fetchTransportServices();
  }, []);

  const fetchTransportServices = async () => {
    try {
      const response = await fetch(`${API_URL}/services?category=Transportation`);
      const data = await response.json();
      
      if (data.success) {
        setServices(data.services);
      } else {
        setError('Failed to load services');
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Icon name="Loader2" size={48} className="mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading transportation services...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-destructive" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchTransportServices} variant="outline">
              <Icon name="RefreshCw" size={16} />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-medium text-foreground mb-4">
            Transportation Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse real transportation services from verified providers
          </p>
        </div>

        {/* Real Services from Database */}
        {services.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="Car" size={48} className="mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Transportation Services Available</h3>
            <p className="text-muted-foreground mb-6">Check back later for new services</p>
            <Button onClick={() => navigate('/journey-planner')}>
              <Icon name="Calendar" size={16} />
              Plan Your Journey
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services?.map((service) => (
            <div key={service?.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-soft hover:shadow-warm transition-all duration-300">
              <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5">
                {service.images && service.images.length > 0 ? (
                  <img 
                    src={service.images[0]} 
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="Car" size={48} className="text-primary/40" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    {service?.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {service?.title}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Icon name="MapPin" size={14} />
                      {service?.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">Tshs {parseFloat(service?.price || 0).toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">per day</div>
                  </div>
                </div>

                {service?.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {service.description}
                  </p>
                )}

                {service?.amenities && service.amenities.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {service.amenities.slice(0, 3).map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Icon name="Check" size={14} className="text-success" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Provider Profile Section */}
                {(service.business_name || service.provider_name) && (
                  <div 
                    className="mb-4 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors border border-border"
                    onClick={() => navigate(`/provider/${service.provider_id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon name="User" size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                          {service.business_name || service.provider_name}
                          {service.provider_verified && <VerifiedBadge size="sm" />}
                        </p>
                        <p className="text-xs text-muted-foreground">View all services from this provider</p>
                      </div>
                      <Icon name="ChevronRight" size={18} className="text-muted-foreground" />
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      const savedUser = localStorage.getItem('isafari_user');
                      if (!savedUser) {
                        navigate('/login?redirect=/services-overview');
                        return;
                      }
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
                      navigate('/traveler-dashboard?tab=cart');
                    }}
                  >
                    <Icon name="ShoppingBag" size={16} />
                    Add to Cart
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      const savedUser = localStorage.getItem('isafari_user');
                      if (!savedUser) {
                        navigate('/login?redirect=/services-overview');
                        return;
                      }
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
                    }}
                  >
                    <Icon name="CreditCard" size={16} />
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
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
    </div>
  );
};

export default TransportationHub;
