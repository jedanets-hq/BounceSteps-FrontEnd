import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { API_URL } from '../../../utils/api';

const PreOrdersSection = ({ bookings, loading, onRefresh }) => {
  const navigate = useNavigate();
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [deletingBooking, setDeletingBooking] = useState(null);

  // Debug: Log bookings data
  React.useEffect(() => {
    if (bookings && bookings.length > 0) {
      console.log('📦 PreOrdersSection - Bookings received:', bookings.length);
      console.log('📋 First booking structure:', bookings[0]);
    }
  }, [bookings]);

  const getServiceImage = (booking) => {
    // Try multiple possible image sources - check all possible fields
    const imageData = booking.service_images || booking.images || booking.service?.images || booking.image;
    
    console.log('🖼️ Getting image for booking:', booking.id, 'imageData:', imageData);
    
    if (!imageData) {
      console.log('⚠️ No image data found for booking:', booking.id);
      return null; // Will show placeholder
    }

    let images = [];
    if (typeof imageData === 'string') {
      try {
        // Try parsing as JSON
        const parsed = JSON.parse(imageData);
        images = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        // If not JSON, treat as single URL or comma-separated URLs
        if (imageData.includes(',')) {
          images = imageData.split(',').map(url => url.trim());
        } else {
          images = [imageData];
        }
      }
    } else if (Array.isArray(imageData)) {
      images = imageData;
    } else if (typeof imageData === 'object' && imageData !== null) {
      // If it's an object, try to extract URLs
      images = Object.values(imageData).filter(v => typeof v === 'string' && (v.startsWith('http') || v.startsWith('/')));
    }
    
    // Filter out empty strings and return first valid image
    const validImages = images.filter(img => img && typeof img === 'string' && img.trim().length > 0);
    console.log('✅ Valid images found:', validImages.length, validImages[0]?.substring(0, 50));
    return validImages.length > 0 ? validImages[0] : null;
  };

  const toggleExpanded = (bookingId) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  // Delete/Cancel pre-order PERMANENTLY
  const handleDeletePreOrder = async (bookingId) => {
    if (!confirm('⚠️ DELETE PERMANENTLY?\n\nThis will permanently remove this pre-order. This action cannot be undone.\n\nAre you sure?')) {
      return;
    }

    try {
      setDeletingBooking(bookingId);
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      if (!token) {
        alert('Please login to delete pre-orders');
        return;
      }

      const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Pre-order deleted permanently!');
        // Refresh the bookings list
        if (onRefresh) {
          onRefresh();
        } else {
          window.location.reload();
        }
      } else {
        alert('❌ Failed to delete: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting pre-order:', error);
      alert('❌ Error deleting pre-order. Please try again.');
    } finally {
      setDeletingBooking(null);
    }
  };

  // Enhanced Booking Card Component
  const BookingCard = ({ booking, status, statusConfig }) => {
    const isExpanded = expandedBooking === booking.id;
    const serviceImage = getServiceImage(booking);

    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden border-2 ${statusConfig.borderColor} shadow-sm hover:shadow-md transition-all duration-200`}>
        {/* Service Image & Header */}
        <div className="flex gap-4 p-4">
          <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
            {serviceImage ? (
              <img 
                src={serviceImage} 
                alt={booking.service_title || 'Service'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center">
                      <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  `;
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs mt-1">No Image</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h5 className="font-semibold text-foreground text-lg leading-tight">
                  {booking.service_title || booking.service?.title || 'Service Booking'}
                </h5>
                <p className="text-sm text-muted-foreground flex items-center mt-1">
                  <Icon name="Building2" size={14} className="mr-1" />
                  {booking.business_name || booking.provider?.businessName || 'Service Provider'}
                </p>
                {(booking.service_location || booking.service?.location) && (
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <Icon name="MapPin" size={12} className="mr-1" />
                    {booking.service_location || booking.service?.location}
                  </p>
                )}
              </div>
              <span className={`px-3 py-1 ${statusConfig.badgeColor} rounded-full text-xs font-medium whitespace-nowrap ml-2`}>
                {statusConfig.badge}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm mt-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 ${statusConfig.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon name="Calendar" size={14} className={statusConfig.iconColor} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Travel Date</p>
                  <p className="font-medium">{new Date(booking.booking_date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 ${statusConfig.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon name="Banknote" size={14} className={statusConfig.iconColor} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className={`font-medium ${status === 'cancelled' ? 'line-through text-muted-foreground' : 'text-primary'}`}>
                    TZS {booking.total_price?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Description (Expandable) */}
        {(booking.service_description || booking.service?.description) && (
          <div className="px-4 pb-2">
            <button
              onClick={() => toggleExpanded(booking.id)}
              className="text-sm text-primary hover:text-primary/80 font-medium flex items-center transition-colors"
            >
              <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} className="mr-1" />
              {isExpanded ? 'Hide Service Details' : 'View Service Details'}
            </button>
            {isExpanded && (
              <div className="mt-3 p-4 bg-muted/40 rounded-lg border border-muted">
                <p className="font-semibold text-foreground mb-2 flex items-center">
                  <Icon name="Info" size={16} className="mr-2 text-primary" />
                  Service Description
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {booking.service_description || booking.service?.description}
                </p>
                
                {/* Additional Details */}
                <div className="mt-3 pt-3 border-t border-muted grid grid-cols-2 gap-2 text-xs">
                  {booking.participants && (
                    <div>
                      <span className="text-muted-foreground">Participants:</span>
                      <span className="ml-1 font-medium text-foreground">{booking.participants}</span>
                    </div>
                  )}
                  {booking.special_requests && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Special Requests:</span>
                      <p className="text-foreground mt-1">{booking.special_requests}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Provider Message Section */}
        <div className={`${statusConfig.messageBg} border-t ${statusConfig.borderColor} p-4`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 ${statusConfig.iconBg} rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ${statusConfig.ringColor}`}>
              <Icon name={statusConfig.icon} size={18} className={statusConfig.iconColor} />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${statusConfig.messageTitle} mb-1 flex items-center`}>
                <Icon name="MessageSquare" size={14} className="mr-1" />
                Provider Message
              </p>
              <p className={`text-sm ${statusConfig.messageText} leading-relaxed`}>
                {statusConfig.message(booking)}
              </p>
              
              {/* Contact Info for Confirmed Orders */}
              {status === 'confirmed' && (
                <div className="mt-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-green-200">
                  <p className="text-xs font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center">
                    <Icon name="Phone" size={14} className="mr-1" />
                    Contact Provider:
                  </p>
                  <div className="flex flex-col gap-2 text-sm">
                    {(booking.provider_phone || booking.provider?.phone) && (
                      <a 
                        href={`tel:${booking.provider_phone || booking.provider?.phone}`} 
                        className="flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        <Icon name="Phone" size={14} className="mr-2" />
                        {booking.provider_phone || booking.provider?.phone}
                      </a>
                    )}
                    {(booking.provider_email || booking.provider?.email) && (
                      <a 
                        href={`mailto:${booking.provider_email || booking.provider?.email}`} 
                        className="flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        <Icon name="Mail" size={14} className="mr-2" />
                        {booking.provider_email || booking.provider?.email}
                      </a>
                    )}
                    {!(booking.provider_phone || booking.provider?.phone || booking.provider_email || booking.provider?.email) && (
                      <p className="text-xs text-muted-foreground italic">
                        Contact details will be shared by the provider shortly.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Button for Rejected Orders */}
              {status === 'cancelled' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-3 w-full border-red-300 hover:bg-red-50"
                  onClick={() => navigate('/journey-planner')}
                >
                  <Icon name="Search" size={14} />
                  Find Alternative Services
                </Button>
              )}
              
              {/* Delete Pre-Order Button - Available for all statuses */}
              <div className="mt-3 pt-3 border-t border-muted/50">
                <button
                  onClick={() => handleDeletePreOrder(booking.id)}
                  disabled={deletingBooking === booking.id}
                  className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deletingBooking === booking.id ? (
                    <Icon name="Loader2" size={14} className="animate-spin" />
                  ) : (
                    <Icon name="Trash2" size={14} />
                  )}
                  <span>Delete Pre-Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Package" size={20} className="mr-2 text-primary" />
          My Pre-Orders & Provider Feedback
        </h3>
        <div className="text-center py-12">
          <Icon name="Loader2" size={40} className="animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Loading your pre-orders...</p>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Package" size={20} className="mr-2 text-primary" />
          My Pre-Orders & Provider Feedback
        </h3>
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Package" size={32} className="text-muted-foreground" />
          </div>
          <h4 className="font-semibold text-foreground mb-2">No Pre-Orders Yet</h4>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Browse our services in the Journey Planner and submit pre-orders to see them here with provider feedback and status updates.
          </p>
          <Button onClick={() => navigate('/journey-planner')}>
            <Icon name="Plus" size={16} />
            Browse Services
          </Button>
        </div>
      </div>
    );
  }

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const rejectedBookings = bookings.filter(b => b.status === 'cancelled');
  const completedBookings = bookings.filter(b => b.status === 'completed');

  const statusConfigs = {
    pending: {
      badge: '📋 Under Review',
      badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
      borderColor: 'border-yellow-300',
      messageBg: 'bg-yellow-50 dark:bg-yellow-900/10',
      messageTitle: 'text-yellow-800 dark:text-yellow-200',
      messageText: 'text-yellow-700 dark:text-yellow-300',
      icon: 'Clock',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-700 dark:text-yellow-300',
      ringColor: 'ring-yellow-200',
      message: (booking) => `${booking.business_name || 'The service provider'} is currently reviewing your pre-order request. You'll receive a notification as soon as they respond. This usually takes 24-48 hours.`
    },
    confirmed: {
      badge: '✅ Approved',
      badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
      borderColor: 'border-green-300',
      messageBg: 'bg-green-50 dark:bg-green-900/10',
      messageTitle: 'text-green-800 dark:text-green-200',
      messageText: 'text-green-700 dark:text-green-300',
      icon: 'CheckCircle',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-700 dark:text-green-300',
      ringColor: 'ring-green-200',
      message: (booking) => `🎉 Your pre-order has been approved! ${booking.business_name || 'The service provider'} has confirmed your booking. They will contact you shortly with payment details and further instructions to finalize your trip.`
    },
    cancelled: {
      badge: '❌ Rejected',
      badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
      borderColor: 'border-red-300',
      messageBg: 'bg-red-50 dark:bg-red-900/10',
      messageTitle: 'text-red-800 dark:text-red-200',
      messageText: 'text-red-700 dark:text-red-300',
      icon: 'XCircle',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-700 dark:text-red-300',
      ringColor: 'ring-red-200',
      message: (booking) => `Your pre-order has been rejected. ${booking.business_name || 'The service provider'} is unable to fulfill your booking at the requested time. This may be due to availability issues. Please explore alternative services or contact the provider for different dates.`
    },
    completed: {
      badge: '🎉 Completed',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
      borderColor: 'border-blue-300',
      messageBg: 'bg-blue-50 dark:bg-blue-900/10',
      messageTitle: 'text-blue-800 dark:text-blue-200',
      messageText: 'text-blue-700 dark:text-blue-300',
      icon: 'CheckCircle2',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-700 dark:text-blue-300',
      ringColor: 'ring-blue-200',
      message: (booking) => `Your trip with ${booking.business_name || 'the service provider'} has been completed! We hope you had an amazing experience. Please consider leaving a review to help other travelers.`
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-foreground text-xl flex items-center">
          <Icon name="Package" size={22} className="mr-2 text-primary" />
          My Pre-Orders & Provider Feedback
        </h3>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-foreground">{bookings.length}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Pending Pre-Orders */}
        {pendingBookings.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 flex items-center">
                <Icon name="Clock" size={18} className="mr-2" />
                📋 Under Review
              </h4>
              <span className="text-sm text-muted-foreground">
                {pendingBookings.length} {pendingBookings.length === 1 ? 'order' : 'orders'}
              </span>
            </div>
            <div className="space-y-4">
              {pendingBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} status="pending" statusConfig={statusConfigs.pending} />
              ))}
            </div>
          </div>
        )}

        {/* Confirmed Pre-Orders */}
        {confirmedBookings.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-green-800 dark:text-green-200 flex items-center">
                <Icon name="CheckCircle" size={18} className="mr-2" />
                ✅ Pre-Order Approved
              </h4>
              <span className="text-sm text-muted-foreground">
                {confirmedBookings.length} {confirmedBookings.length === 1 ? 'order' : 'orders'}
              </span>
            </div>
            <div className="space-y-4">
              {confirmedBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} status="confirmed" statusConfig={statusConfigs.confirmed} />
              ))}
            </div>
          </div>
        )}

        {/* Rejected Pre-Orders */}
        {rejectedBookings.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-red-800 dark:text-red-200 flex items-center">
                <Icon name="XCircle" size={18} className="mr-2" />
                ❌ Pre-Order Rejected
              </h4>
              <span className="text-sm text-muted-foreground">
                {rejectedBookings.length} {rejectedBookings.length === 1 ? 'order' : 'orders'}
              </span>
            </div>
            <div className="space-y-4">
              {rejectedBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} status="cancelled" statusConfig={statusConfigs.cancelled} />
              ))}
            </div>
          </div>
        )}

        {/* Completed Bookings */}
        {completedBookings.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 flex items-center">
                <Icon name="CheckCircle2" size={18} className="mr-2" />
                🎉 Trip Completed
              </h4>
              <span className="text-sm text-muted-foreground">
                {completedBookings.length} {completedBookings.length === 1 ? 'trip' : 'trips'}
              </span>
            </div>
            <div className="space-y-4">
              {completedBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} status="completed" statusConfig={statusConfigs.completed} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreOrdersSection;
