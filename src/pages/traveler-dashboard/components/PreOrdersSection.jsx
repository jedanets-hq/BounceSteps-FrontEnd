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
    
    if (!imageData) {
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
      images = Object.values(imageData).filter(v => typeof v === 'string' && (v.startsWith('http') || v.startsWith('/') || v.startsWith('data:')));
    }
    
    // Filter out empty strings and return first valid image
    const validImages = images.filter(img => img && typeof img === 'string' && img.trim().length > 0);
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
        {/* Service Image & Header - MOBILE RESPONSIVE */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4">
          {/* Mobile: Image smaller and responsive, Desktop: Fixed size */}
          <div className="w-full sm:w-20 md:w-24 lg:w-28 h-32 sm:h-20 md:h-24 lg:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-purple-100 dark:from-blue-900 dark:to-purple-900">
            {serviceImage ? (
              <img 
                src={serviceImage} 
                alt={booking.service_title || 'Service'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center">
                      <svg class="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  `;
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                <svg className="w-8 h-8 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs mt-1 hidden sm:block">No Image</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Title and Status Badge - MOBILE STACKED */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h5 className="font-semibold text-foreground text-base sm:text-lg leading-tight break-words">
                  {booking.service_title || booking.service?.title || 'Service Booking'}
                </h5>
                <div className="text-sm text-muted-foreground flex items-center mt-1 break-words">
                  <Icon name="Building2" size={14} className="mr-1 flex-shrink-0" />
                  <span className="truncate">{booking.business_name || booking.provider?.businessName || 'Service Provider'}</span>
                </div>
                {(booking.service_location || booking.service?.location) && (
                  <div className="text-xs text-muted-foreground flex items-center mt-1 break-words">
                    <Icon name="MapPin" size={12} className="mr-1 flex-shrink-0" />
                    <span className="truncate">{booking.service_location || booking.service?.location}</span>
                  </div>
                )}
              </div>
              <span className={`px-2 sm:px-3 py-1 ${statusConfig.badgeColor} rounded-full text-xs font-medium whitespace-nowrap self-start sm:ml-2`}>
                {statusConfig.badge}
              </span>
            </div>
            
            {/* Date and Amount - MOBILE FRIENDLY GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm mt-3">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 ${statusConfig.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon name="Calendar" size={12} className={`sm:size-14 ${statusConfig.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Travel Date</p>
                  <p className="font-medium text-sm break-words">{new Date(booking.booking_date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 ${statusConfig.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon name="Banknote" size={12} className={`sm:size-14 ${statusConfig.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className={`font-medium text-sm break-words ${status === 'cancelled' ? 'line-through text-muted-foreground' : 'text-primary'}`}>
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
                <div className="font-semibold text-foreground mb-2 flex items-center">
                  <Icon name="Info" size={16} className="mr-2 text-primary" />
                  Service Description
                </div>
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

        {/* Provider Message Section - MOBILE OPTIMIZED */}
        <div className={`${statusConfig.messageBg} border-t ${statusConfig.borderColor} p-3 sm:p-4`}>
          <div className="flex items-start gap-2 sm:gap-3">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${statusConfig.iconBg} rounded-full flex items-center justify-center flex-shrink-0 ring-1 sm:ring-2 ring-offset-1 sm:ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ${statusConfig.ringColor}`}>
              <Icon name={statusConfig.icon} size={16} className={`sm:size-18 ${statusConfig.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-semibold ${statusConfig.messageTitle} mb-1 flex items-center break-words`}>
                <Icon name="MessageSquare" size={14} className="mr-1 flex-shrink-0" />
                <span className="break-words">Provider Message</span>
              </div>
              <p className={`text-sm ${statusConfig.messageText} leading-relaxed break-words`}>
                {statusConfig.message(booking)}
              </p>
              
              {/* Contact Info for Confirmed Orders - MOBILE RESPONSIVE */}
              {status === 'confirmed' && (
                <div className="mt-3 p-2 sm:p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-green-200">
                  <div className="text-xs font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center break-words">
                    <Icon name="Phone" size={14} className="mr-1 flex-shrink-0" />
                    <span className="break-words">Contact Provider:</span>
                  </div>
                  <div className="flex flex-col gap-2 text-sm">
                    {(booking.provider_phone || booking.provider?.phone) && (
                      <a 
                        href={`tel:${booking.provider_phone || booking.provider?.phone}`} 
                        className="flex items-center text-primary hover:text-primary/80 font-medium transition-colors break-all"
                      >
                        <Icon name="Phone" size={14} className="mr-2 flex-shrink-0" />
                        <span className="break-all">{booking.provider_phone || booking.provider?.phone}</span>
                      </a>
                    )}
                    {(booking.provider_email || booking.provider?.email) && (
                      <a 
                        href={`mailto:${booking.provider_email || booking.provider?.email}`} 
                        className="flex items-center text-primary hover:text-primary/80 font-medium transition-colors break-all"
                      >
                        <Icon name="Mail" size={14} className="mr-2 flex-shrink-0" />
                        <span className="break-all">{booking.provider_email || booking.provider?.email}</span>
                      </a>
                    )}
                    {!(booking.provider_phone || booking.provider?.phone || booking.provider_email || booking.provider?.email) && (
                      <p className="text-xs text-muted-foreground italic break-words">
                        Contact details will be shared by the provider shortly.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Button for Rejected Orders - MOBILE RESPONSIVE */}
              {status === 'cancelled' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-3 w-full border-red-300 hover:bg-red-50 text-sm"
                  onClick={() => navigate('/journey-planner')}
                >
                  <Icon name="Search" size={14} className="flex-shrink-0" />
                  <span className="ml-2 break-words">Find Alternative Services</span>
                </Button>
              )}
              
              {/* Delete Pre-Order Button - MOBILE RESPONSIVE */}
              <div className="mt-3 pt-3 border-t border-muted/50">
                <button
                  onClick={() => handleDeletePreOrder(booking.id)}
                  disabled={deletingBooking === booking.id}
                  className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-2 sm:px-3 py-2 rounded-lg transition-colors disabled:opacity-50 w-full sm:w-auto justify-center sm:justify-start"
                >
                  {deletingBooking === booking.id ? (
                    <Icon name="Loader2" size={14} className="animate-spin flex-shrink-0" />
                  ) : (
                    <Icon name="Trash2" size={14} className="flex-shrink-0" />
                  )}
                  <span className="break-words">Delete Pre-Order</span>
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

  // Ensure bookings is always an array before filtering
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  
  const pendingBookings = safeBookings.filter(b => b.status === 'pending');
  const confirmedBookings = safeBookings.filter(b => b.status === 'confirmed');
  const rejectedBookings = safeBookings.filter(b => b.status === 'cancelled');
  const completedBookings = safeBookings.filter(b => b.status === 'completed');

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
      badge: 'Approved',
      badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
      borderColor: 'border-green-300',
      messageBg: 'bg-green-50 dark:bg-green-900/10',
      messageTitle: 'text-green-800 dark:text-green-200',
      messageText: 'text-green-700 dark:text-green-300',
      icon: 'CheckCircle',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-700 dark:text-green-300',
      ringColor: 'ring-green-200',
      message: (booking) => `Your pre-order has been approved! ${booking.business_name || 'The service provider'} has confirmed your booking. They will contact you shortly with payment details and further instructions to finalize your trip.`
    },
    cancelled: {
      badge: 'Rejected',
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
      badge: 'Completed',
      badgeColor: 'bg-primary/10 text-primary dark:bg-blue-900/30 dark:text-primary/80',
      borderColor: 'border-blue-300',
      messageBg: 'bg-primary/5 dark:bg-blue-900/10',
      messageTitle: 'text-primary dark:text-primary/80',
      messageText: 'text-primary dark:text-primary/70',
      icon: 'CheckCircle2',
      iconBg: 'bg-primary/10 dark:bg-blue-900/30',
      iconColor: 'text-primary dark:text-primary/70',
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
                Pre-Order Approved
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
                Pre-Order Rejected
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
              <h4 className="font-semibold text-primary dark:text-primary/80 flex items-center">
                <Icon name="CheckCircle2" size={18} className="mr-2" />
                Trip Completed
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
