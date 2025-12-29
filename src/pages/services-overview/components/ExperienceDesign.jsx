import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import VerifiedBadge from '../../../components/ui/VerifiedBadge';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { PaymentModal, BookingConfirmation } from '../../../components/PaymentSystem';
import { API_URL } from '../../../utils/api';

const ExperienceDesign = ({ title = "Tours & Activities", description = "Discover authentic experiences from verified tour providers", category = "Tours & Activities" }) => {
  const navigate = useNavigate();
  const { addToCart, cartItems, getCartTotal } = useCart();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    fetchServices();
  }, [category, title]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      // Map title to category for API
      let apiCategory = category;
      if (title === "Food & Dining") apiCategory = "Food & Dining";
      else if (title === "Tours & Activities") apiCategory = "Tours & Activities";
      else if (title === "Shopping") apiCategory = "Shopping";
      else if (title === "Health & Wellness") apiCategory = "Health & Wellness";
      
      const response = await fetch(`${API_URL}/services?category=${encodeURIComponent(apiCategory)}&limit=20`);
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
            <p className="text-muted-foreground">Loading tours & activities...</p>
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
            {title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {/* Real Services from Database */}
        {services.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="Compass" size={48} className="mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No {title} Available</h3>
            <p className="text-muted-foreground mb-6">Check back later for new services in this category</p>
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
                    <Icon name="Compass" size={48} className="text-primary/40" />
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

                {/* Payment Methods Display */}
                {service?.payment_methods && Object.keys(service.payment_methods).some(key => service.payment_methods[key]?.enabled) && (
                  <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Accepted Payments:</p>
                    <div className="flex flex-wrap gap-2">
                      {service.payment_methods.visa?.enabled && (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          <Icon name="CreditCard" size={12} className="mr-1" />
                          Visa/Card
                        </span>
                      )}
                      {service.payment_methods.paypal?.enabled && (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          <span className="w-3 h-3 mr-1 bg-blue-700 rounded text-white text-[8px] flex items-center justify-center font-bold">P</span>
                          PayPal
                        </span>
                      )}
                      {service.payment_methods.googlePay?.enabled && (
                        <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-blue-100 to-red-100 text-gray-700 rounded text-xs">
                          <span className="w-3 h-3 mr-1 bg-gradient-to-r from-blue-500 to-red-500 rounded text-white text-[8px] flex items-center justify-center font-bold">G</span>
                          Google Pay
                        </span>
                      )}
                      {service.payment_methods.mobileMoney?.enabled && (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          <Icon name="Smartphone" size={12} className="mr-1" />
                          Mobile Money
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Information Display */}
                {service?.contact_info && (service.contact_info.email?.enabled || service.contact_info.whatsapp?.enabled) && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {service.contact_info.whatsapp?.enabled && service.contact_info.whatsapp?.number && (
                      <a 
                        href={`https://wa.me/${service.contact_info.whatsapp.number.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 transition-colors"
                      >
                        <Icon name="MessageCircle" size={14} className="mr-1" />
                        WhatsApp
                      </a>
                    )}
                    {service.contact_info.email?.enabled && service.contact_info.email?.address && (
                      <a 
                        href={`mailto:${service.contact_info.email.address}`}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600 transition-colors"
                      >
                        <Icon name="Mail" size={14} className="mr-1" />
                        Email
                      </a>
                    )}
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
                    onClick={async () => {
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
                      const result = await addToCart(bookingItem);
                      if (result.success) {
                        navigate('/traveler-dashboard?tab=cart');
                      } else {
                        alert(`❌ ${result.message}`);
                      }
                    }}
                  >
                    <Icon name="ShoppingBag" size={16} />
                    Add to Cart
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    className="flex-1"
                    onClick={async () => {
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
                      const result = await addToCart(bookingItem);
                      if (result.success) {
                        navigate('/traveler-dashboard?tab=cart&openPayment=true');
                      } else {
                        alert(`❌ ${result.message}`);
                      }
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

export default ExperienceDesign;
