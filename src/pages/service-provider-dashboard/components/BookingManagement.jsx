import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BookingManagement = ({ bookings = [], onUpdateBookingStatus, onDeleteBooking, loading = false }) => {
  const [filterStatus, setFilterStatus] = useState('pending'); // Default to pending to show action required
  const [processingId, setProcessingId] = useState(null);

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus);

  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  const handleBookingAction = async (bookingId, action) => {
    const actionText = action === 'confirmed' ? 'APPROVE' : action === 'cancelled' ? 'REJECT' : action;
    if (!confirm(`Are you sure you want to ${actionText} this pre-order request?\n\nThe traveler will be notified of your decision.`)) {
      return;
    }
    setProcessingId(bookingId);
    try {
      await onUpdateBookingStatus(bookingId, action);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!confirm('⚠️ DELETE PERMANENTLY?\n\nThis will permanently remove this pre-order from the system. This action cannot be undone.')) {
      return;
    }
    setProcessingId(bookingId);
    try {
      if (onDeleteBooking) {
        await onDeleteBooking(bookingId);
      }
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: 'bg-gradient-to-r from-yellow-400 to-orange-400',
        text: 'text-white',
        icon: 'Clock',
        label: 'Pending Review'
      },
      confirmed: {
        bg: 'bg-gradient-to-r from-green-400 to-emerald-500',
        text: 'text-white',
        icon: 'CheckCircle',
        label: 'Approved'
      },
      completed: {
        bg: 'bg-gradient-to-r from-blue-400 to-indigo-500',
        text: 'text-white',
        icon: 'Award',
        label: 'Completed'
      },
      cancelled: {
        bg: 'bg-gradient-to-r from-red-400 to-pink-500',
        text: 'text-white',
        icon: 'XCircle',
        label: 'Rejected'
      }
    };
    
    const badge = badges[status] || badges.pending;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${badge.bg} ${badge.text}`}>
        <Icon name={badge.icon} size={14} />
        <span>{badge.label}</span>
      </span>
    );
  };

  // Get service image from booking
  const getServiceImage = (booking) => {
    const imageData = booking.service_images || booking.images;
    
    if (!imageData) return null;

    let images = [];
    if (typeof imageData === 'string') {
      try {
        const parsed = JSON.parse(imageData);
        images = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        if (imageData.includes(',')) {
          images = imageData.split(',').map(url => url.trim());
        } else {
          images = [imageData];
        }
      }
    } else if (Array.isArray(imageData)) {
      images = imageData;
    }
    
    const validImages = images.filter(img => img && typeof img === 'string' && img.trim().length > 0);
    return validImages.length > 0 ? validImages[0] : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-medium">Pre-Order Management</h3>
        <Button variant="outline" size="sm" onClick={() => alert('Export functionality will be implemented')} className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600">
          <Icon name="Download" size={16} />
          Export
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            filterStatus === 'all'
              ? 'bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/30 scale-105'
              : 'bg-card border-2 border-border text-muted-foreground hover:border-primary/50 hover:scale-105'
          }`}
        >
          <Icon name="List" size={16} />
          All ({statusCounts.all})
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            filterStatus === 'pending'
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-400/30 scale-105'
              : 'bg-card border-2 border-border text-muted-foreground hover:border-yellow-400/50 hover:scale-105'
          }`}
        >
          <Icon name="Clock" size={16} />
          Pending ({statusCounts.pending})
        </button>
        <button
          onClick={() => setFilterStatus('confirmed')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            filterStatus === 'confirmed'
              ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg shadow-green-400/30 scale-105'
              : 'bg-card border-2 border-border text-muted-foreground hover:border-green-400/50 hover:scale-105'
          }`}
        >
          <Icon name="CheckCircle" size={16} />
          Approved ({statusCounts.confirmed})
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            filterStatus === 'completed'
              ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-lg shadow-blue-400/30 scale-105'
              : 'bg-card border-2 border-border text-muted-foreground hover:border-blue-400/50 hover:scale-105'
          }`}
        >
          <Icon name="Award" size={16} />
          Completed ({statusCounts.completed})
        </button>
        <button
          onClick={() => setFilterStatus('cancelled')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            filterStatus === 'cancelled'
              ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-lg shadow-red-400/30 scale-105'
              : 'bg-card border-2 border-border text-muted-foreground hover:border-red-400/50 hover:scale-105'
          }`}
        >
          <Icon name="XCircle" size={16} />
          Rejected ({statusCounts.cancelled})
        </button>
      </div>

      {/* Info message for pending orders */}
      {filterStatus === 'pending' && statusCounts.pending > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon name="AlertCircle" size={20} className="text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">Action Required - Traveler Waiting!</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                You have {statusCounts.pending} pre-order request(s) waiting for your decision. 
                Click <strong>"Approve"</strong> to accept or <strong>"Reject"</strong> to decline. 
                The traveler will be notified immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No pending orders message */}
      {filterStatus === 'pending' && statusCounts.pending === 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon name="CheckCircle" size={20} className="text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">All Caught Up!</p>
              <p className="text-sm text-green-700 dark:text-green-300">
                No pending pre-order requests. Check other tabs to see approved, rejected, or completed bookings.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading pre-orders...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="Calendar" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {filterStatus === 'all' ? 'No pre-orders yet' : `No ${filterStatus} pre-orders`}
            </p>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const serviceImage = getServiceImage(booking);
            
            return (
            <div key={booking.id} className="bg-card border border-border rounded-lg p-3 sm:p-6">
              {/* Mobile-optimized layout */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 mb-4">
                {/* Service Image - Mobile optimized */}
                <div className="w-full h-32 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                  {serviceImage ? (
                    <img 
                      src={serviceImage} 
                      alt={booking.service_title || 'Service'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex-col items-center justify-center text-gray-400 ${serviceImage ? 'hidden' : 'flex'}`}>
                    <Icon name="Image" size={24} />
                    <span className="text-xs mt-1">No Image</span>
                  </div>
                </div>
                
                {/* Content - Mobile optimized */}
                <div className="flex-1 min-w-0">
                  {/* Header with status - Mobile stacked */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <h4 className="font-semibold text-foreground text-sm sm:text-base truncate">
                      {`${booking.traveler_first_name || ''} ${booking.traveler_last_name || ''}`.trim() || booking.traveler?.name || 'Unknown Traveler'}
                    </h4>
                    {getStatusBadge(booking.status)}
                  </div>
                  
                  {/* Service title */}
                  <p className="text-sm text-muted-foreground mb-3 font-medium">{booking.service_title || 'Service'}</p>
                  
                  {/* Details grid - Mobile optimized */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between sm:block">
                      <span className="text-muted-foreground">Travel Date:</span>
                      <p className="font-medium text-foreground sm:mt-0">
                        {booking.travel_date ? new Date(booking.travel_date).toLocaleDateString() : 'Not specified'}
                      </p>
                    </div>
                    <div className="flex justify-between sm:block">
                      <span className="text-muted-foreground">Total Amount:</span>
                      <p className="font-medium text-foreground sm:mt-0">TZS {parseFloat(booking.total_amount || 0).toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between sm:block">
                      <span className="text-muted-foreground">Guests:</span>
                      <p className="font-medium text-foreground sm:mt-0">{booking.number_of_guests || booking.participants || 1}</p>
                    </div>
                    <div className="flex justify-between sm:block">
                      <span className="text-muted-foreground">Pre-Ordered:</span>
                      <p className="font-medium text-foreground sm:mt-0">
                        {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Special requests */}
                  {booking.special_requests && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <span className="text-xs text-muted-foreground">Special Requests:</span>
                      <p className="text-sm text-foreground mt-1">{booking.special_requests}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons - Mobile optimized to fit within card */}
              <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-border">
                {booking.status === 'pending' && (
                  <>
                    <Button 
                      variant="default" 
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 flex-1 h-9 text-sm"
                      onClick={() => handleBookingAction(booking.id, 'confirmed')}
                      disabled={processingId === booking.id}
                    >
                      {processingId === booking.id ? (
                        <Icon name="Loader2" size={14} className="animate-spin" />
                      ) : (
                        <Icon name="Check" size={14} />
                      )}
                      <span className="ml-1">Approve Pre-Order</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-red-300 text-red-600 hover:bg-red-50 flex-1 h-9 text-sm"
                      onClick={() => handleBookingAction(booking.id, 'cancelled')}
                      disabled={processingId === booking.id}
                    >
                      {processingId === booking.id ? (
                        <Icon name="Loader2" size={14} className="animate-spin" />
                      ) : (
                        <Icon name="X" size={14} />
                      )}
                      <span className="ml-1">Reject</span>
                    </Button>
                  </>
                )}
                {booking.status === 'confirmed' && (
                  <Button 
                    variant="default" 
                    size="sm"
                    className="flex-1 h-9 text-sm"
                    onClick={() => handleBookingAction(booking.id, 'completed')}
                    disabled={processingId === booking.id}
                  >
                    {processingId === booking.id ? (
                      <Icon name="Loader2" size={14} className="animate-spin" />
                    ) : (
                      <Icon name="CheckCircle" size={14} />
                    )}
                    <span className="ml-1">Mark as Completed</span>
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-error hover:text-error hover:bg-error/10 h-9 text-sm px-3"
                  onClick={() => handleDeleteBooking(booking.id)}
                  disabled={processingId === booking.id}
                >
                  {processingId === booking.id ? (
                    <Icon name="Loader2" size={14} className="animate-spin" />
                  ) : (
                    <Icon name="Trash2" size={14} />
                  )}
                  <span className="ml-1 hidden sm:inline">Delete</span>
                </Button>
              </div>
            </div>
          )})
        )}
      </div>
    </div>
  );
};

export default BookingManagement;
