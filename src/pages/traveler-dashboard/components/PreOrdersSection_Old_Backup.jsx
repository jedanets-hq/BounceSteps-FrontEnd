import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PreOrdersSection = ({ bookings, loading }) => {
  const navigate = useNavigate();
  const [expandedBooking, setExpandedBooking] = useState(null);

  const getServiceImage = (booking) => {
    // Handle service images
    let images = [];
    if (booking.service_images) {
      if (typeof booking.service_images === 'string') {
        try {
          images = JSON.parse(booking.service_images);
        } catch (e) {
          images = [booking.service_images];
        }
      } else if (Array.isArray(booking.service_images)) {
        images = booking.service_images;
      }
    }
    return images.length > 0 ? images[0] : '/placeholder-service.jpg';
  };

  const toggleExpanded = (bookingId) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Clock" size={20} className="mr-2 text-primary" />
          My Pre-Orders & Status
        </h3>
        <div className="text-center py-8">
          <Icon name="Loader2" size={32} className="animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Loading your pre-orders...</p>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Clock" size={20} className="mr-2 text-primary" />
          My Pre-Orders & Status
        </h3>
        <div className="text-center py-8">
          <Icon name="Clock" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No pre-orders yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Pre-orders you submit will appear here with status updates from service providers
          </p>
        </div>
      </div>
    );
  }

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const rejectedBookings = bookings.filter(b => b.status === 'cancelled');
  const completedBookings = bookings.filter(b => b.status === 'completed');

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="font-semibold text-foreground mb-4 flex items-center">
        <Icon name="Clock" size={20} className="mr-2 text-primary" />
        My Pre-Orders & Provider Feedback
      </h3>
      
      <div className="space-y-4">
        {/* Pending Pre-Orders */}
        {pendingBookings.length > 0 && (
          <div className="border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center">
              <Icon name="Clock" size={18} className="mr-2" />
              🟡 Awaiting Provider Response ({pendingBookings.length})
            </h4>
            <div className="space-y-3">
              {pendingBookings.map(booking => {
                const isExpanded = expandedBooking === booking.id;
                const serviceImage = getServiceImage(booking);
                
                return (
                  <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-yellow-300 shadow-sm hover:shadow-md transition-shadow">
                    {/* Service Image & Header */}
                    <div className="flex gap-4 p-4">
                      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={serviceImage} 
                          alt={booking.service_title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EService%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h5 className="font-semibold text-foreground text-lg">{booking.service_title}</h5>
                            <p className="text-sm text-muted-foreground flex items-center mt-1">
                              <Icon name="Building2" size={14} className="mr-1" />
                              {booking.business_name}
                            </p>
                            {booking.service_location && (
                              <p className="text-xs text-muted-foreground flex items-center mt-1">
                                <Icon name="MapPin" size={12} className="mr-1" />
                                {booking.service_location}
                              </p>
                            )}
                          </div>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 rounded-full text-xs font-medium whitespace-nowrap ml-2">
                            ⏳ Pending
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                          <div className="flex items-center">
                            <Icon name="Calendar" size={14} className="mr-1 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Date</p>
                              <p className="font-medium">{new Date(booking.booking_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Icon name="Banknote" size={14} className="mr-1 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Amount</p>
                              <p className="font-medium text-primary">TZS {booking.total_price?.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Service Description (Expandable) */}
                    {booking.service_description && (
                      <div className="px-4 pb-2">
                        <button
                          onClick={() => toggleExpanded(booking.id)}
                          className="text-sm text-primary hover:underline flex items-center"
                        >
                          <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} className="mr-1" />
                          {isExpanded ? 'Hide Details' : 'View Service Details'}
                        </button>
                        {isExpanded && (
                          <div className="mt-2 p-3 bg-muted/30 rounded-lg text-sm text-foreground">
                            <p className="font-medium mb-1">About this service:</p>
                            <p className="text-muted-foreground">{booking.service_description}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Provider Status Message */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 p-4">
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon name="Clock" size={16} className="text-yellow-700 dark:text-yellow-300" />
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                            Awaiting Provider Response
                          </p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300">
                            {booking.business_name} is reviewing your pre-order request. You'll receive a notification when they accept or respond to your booking.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Confirmed Pre-Orders */}
        {confirmedBookings.length > 0 && (
          <div className="border border-green-200 bg-green-50 dark:bg-green-900/10 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center">
              <Icon name="CheckCircle" size={18} className="mr-2" />
              ✅ Confirmed by Provider ({confirmedBookings.length})
            </h4>
            <div className="space-y-3">
              {confirmedBookings.map(booking => (
                <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-300">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h5 className="font-semibold text-foreground">{booking.service_title}</h5>
                      <p className="text-sm text-muted-foreground">{booking.business_name}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 rounded-full text-xs font-medium">
                      ✅ Confirmed
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium">{new Date(booking.booking_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-medium text-primary">TZS {booking.total_price?.toLocaleString()}</p>
                    </div>
                  </div>
                  {/* Provider Feedback */}
                  <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-3 mt-3">
                    <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1 flex items-center">
                      <Icon name="MessageSquare" size={14} className="mr-1" />
                      Provider Feedback
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      🎉 Good news! <strong>{booking.business_name}</strong> has confirmed your booking. 
                      They will contact you shortly with payment details and further instructions.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 mt-3 p-2 bg-muted/50 rounded">
                    <Icon name="Phone" size={14} className="text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Contact: {booking.provider_phone || booking.provider_email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejected Pre-Orders */}
        {rejectedBookings.length > 0 && (
          <div className="border border-red-200 bg-red-50 dark:bg-red-900/10 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 dark:text-red-200 mb-3 flex items-center">
              <Icon name="XCircle" size={18} className="mr-2" />
              ❌ Unable to Fulfill ({rejectedBookings.length})
            </h4>
            <div className="space-y-3">
              {rejectedBookings.map(booking => (
                <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-300">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h5 className="font-semibold text-foreground">{booking.service_title}</h5>
                      <p className="text-sm text-muted-foreground">{booking.business_name}</p>
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 rounded-full text-xs font-medium">
                      ❌ Rejected
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                    <div>
                      <p className="text-muted-foreground">Requested Date</p>
                      <p className="font-medium">{new Date(booking.booking_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-medium text-muted-foreground line-through">
                        TZS {booking.total_price?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {/* Provider Feedback */}
                  <div className="bg-red-100 dark:bg-red-900/20 rounded-lg p-3 mt-3">
                    <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1 flex items-center">
                      <Icon name="MessageSquare" size={14} className="mr-1" />
                      Provider Feedback
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Sorry, <strong>{booking.business_name}</strong> is unable to fulfill this booking at the requested time. 
                      Please try booking another service or contact the provider to discuss alternative dates.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => {
                      navigate('/journey-planner');
                    }}
                  >
                    <Icon name="Search" size={14} />
                    Find Alternative Services
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Bookings */}
        {completedBookings.length > 0 && (
          <div className="border border-blue-200 bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
              <Icon name="CheckCircle2" size={18} className="mr-2" />
              🎉 Trip Completed ({completedBookings.length})
            </h4>
            <div className="space-y-3">
              {completedBookings.map(booking => (
                <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-300">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h5 className="font-semibold text-foreground">{booking.service_title}</h5>
                      <p className="text-sm text-muted-foreground">{booking.business_name}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 rounded-full text-xs font-medium">
                      ✅ Completed
                    </span>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-3 mt-3">
                    <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center">
                      <Icon name="Star" size={14} className="mr-1" />
                      We hope you had a great experience! Please consider leaving a review for {booking.business_name}.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreOrdersSection;
