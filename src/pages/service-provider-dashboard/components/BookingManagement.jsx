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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
        <Button variant="outline" size="sm" onClick={() => alert('Export functionality will be implemented')}>
          <Icon name="Download" size={16} />
          Export
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filterStatus === 'all'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          All ({statusCounts.all})
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filterStatus === 'pending'
              ? 'bg-yellow-500 text-white shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          📋 Pending Review ({statusCounts.pending})
        </button>
        <button
          onClick={() => setFilterStatus('confirmed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filterStatus === 'confirmed'
              ? 'bg-green-500 text-white shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          ✅ Approved ({statusCounts.confirmed})
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filterStatus === 'completed'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          🎉 Completed ({statusCounts.completed})
        </button>
        <button
          onClick={() => setFilterStatus('cancelled')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filterStatus === 'cancelled'
              ? 'bg-red-500 text-white shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          ❌ Rejected ({statusCounts.cancelled})
        </button>
      </div>

      {/* Info message for pending orders */}
      {filterStatus === 'pending' && statusCounts.pending > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon name="AlertCircle" size={20} className="text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">⚡ Action Required - Traveler Waiting!</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                You have {statusCounts.pending} pre-order request(s) waiting for your decision. 
                Click <strong>"✅ Approve"</strong> to accept or <strong>"❌ Reject"</strong> to decline. 
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
              <p className="font-medium text-green-800 dark:text-green-200">✅ All Caught Up!</p>
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
            <div key={booking.id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start gap-4 mb-4">
                {/* Service Image */}
                <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
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
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-foreground">
                        {`${booking.traveler_first_name || ''} ${booking.traveler_last_name || ''}`.trim() || booking.traveler?.name || 'Unknown Traveler'}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status === 'pending' ? '📋 Pending Review' :
                         booking.status === 'confirmed' ? '✅ Approved' :
                         booking.status === 'completed' ? '🎉 Completed' :
                         '❌ Rejected'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{booking.service_title || 'Service'}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Travel Date:</span>
                      <p className="font-medium text-foreground">
                        {booking.travel_date ? new Date(booking.travel_date).toLocaleDateString() : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Amount:</span>
                      <p className="font-medium text-foreground">TZS {parseFloat(booking.total_amount || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Guests:</span>
                      <p className="font-medium text-foreground">{booking.number_of_guests || booking.participants || 1}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pre-Ordered:</span>
                      <p className="font-medium text-foreground">
                        {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  {booking.special_requests && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <span className="text-xs text-muted-foreground">Special Requests:</span>
                      <p className="text-sm text-foreground mt-1">{booking.special_requests}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4 border-t border-border">
                {booking.status === 'pending' && (
                  <>
                    <Button 
                      variant="default" 
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 flex-1"
                      onClick={() => handleBookingAction(booking.id, 'confirmed')}
                      disabled={processingId === booking.id}
                    >
                      {processingId === booking.id ? (
                        <Icon name="Loader2" size={14} className="animate-spin" />
                      ) : (
                        <Icon name="Check" size={14} />
                      )}
                      ✅ Approve Pre-Order
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-red-300 text-red-600 hover:bg-red-50 flex-1"
                      onClick={() => handleBookingAction(booking.id, 'cancelled')}
                      disabled={processingId === booking.id}
                    >
                      {processingId === booking.id ? (
                        <Icon name="Loader2" size={14} className="animate-spin" />
                      ) : (
                        <Icon name="X" size={14} />
                      )}
                      ❌ Reject
                    </Button>
                  </>
                )}
                {booking.status === 'confirmed' && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => handleBookingAction(booking.id, 'completed')}
                    disabled={processingId === booking.id}
                  >
                    {processingId === booking.id ? (
                      <Icon name="Loader2" size={14} className="animate-spin" />
                    ) : (
                      <Icon name="CheckCircle" size={14} />
                    )}
                    Mark as Completed
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDeleteBooking(booking.id)}
                  disabled={processingId === booking.id}
                  className="text-error hover:text-error hover:bg-error/10"
                >
                  {processingId === booking.id ? (
                    <Icon name="Loader2" size={14} className="animate-spin" />
                  ) : (
                    <Icon name="Trash2" size={14} />
                  )}
                  Delete Permanently
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
